from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from typing import Optional
from datetime import datetime
import uuid
import json
from models import ChatRequest, ChatResponse
from auth import get_current_user
from database import history_collection
from ai import graph, vision_llm, convert_to_langchain_messages, VISION_MODEL, tools
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

router = APIRouter()

@router.post("/chat")
async def chat_endpoint(request: ChatRequest, current_user: Optional[str] = Depends(get_current_user)):
    async def event_generator():
        try:
            print(f"DEBUG: Starting chat stream for session {request.session_id}")
            messages = []
            session_id = request.session_id or str(uuid.uuid4())
            
            from database import settings_collection
            settings = await settings_collection.find_one({"type": "general"})
            
            # Base system prompt from DB or default
            system_prompt = "You are a helpful AI assistant."
            if settings and settings.get("system_prompt"):
                system_prompt = settings.get("system_prompt")
            
            # Reinforce real-time date and brevity instructions
            current_date_str = datetime.now().strftime("%A, %B %d, %Y")
            current_time_str = datetime.now().strftime("%H:%M:%S")
            dynamic_instructions = (
                f"\n\nCRITICAL INSTRUCTIONS:\n"
                f"- Today's date is {current_date_str}, current time is {current_time_str}.\n"
                f"- You have access to tools: {', '.join([t.name for t in tools])}.\n"
                f"- For ANY information about 2024, 2025, or current events, you MUST call the appropriate tool immediately. JUST USE IT.\n"
                f"- IMPORTANT: NEVER provide links, URLs, or citations in your final answer unless the user specifically asks for a link. Provide ONLY the facts and data.\n"
                f"- When you use `search`, synthesize the results into a direct answer. Do NOT just list links or snippets.\n"
                f"- If you are unsure, use `search`.\n"
                f"- For greetings, stay EXTREMELY brief."
            )
            
            messages = [SystemMessage(content=system_prompt + dynamic_instructions)]
            
            if current_user:
                history_cursor = history_collection.find({
                    "user_email": current_user,
                    "session_id": session_id
                }).sort("timestamp", 1).limit(40)
                history_data = await history_cursor.to_list(length=40)
                for h in history_data:
                    if h["role"] == "user":
                        messages.append(HumanMessage(content=h["content"]))
                    else:
                        messages.append(AIMessage(content=h["content"]))
            else:
                converted_history = convert_to_langchain_messages(request.messages[:-1])
                messages.extend(converted_history)

            latest_msg = request.messages[-1]
            user_content = latest_msg.content
            if request.file_content:
                user_content = f"Attached File Content:\n{request.file_content}\n\nUser Message: {user_content}"
            
            yield f"data: {json.dumps({'session_id': session_id})}\n\n"

            full_response = ""
            
            if request.image:
                print("DEBUG: Using Vision LLM stream")
                messages.append(HumanMessage(content=[
                    {"type": "text", "text": user_content},
                    {"type": "image_url", "image_url": request.image}
                ]))
                async for chunk in vision_llm.astream(messages):
                    content = chunk.content
                    full_response += content
                    yield f"data: {json.dumps({'content': content})}\n\n"
            else:
                print("DEBUG: Using Graph astream_events")
                messages.append(HumanMessage(content=user_content))
                async for event in graph.astream_events({"messages": messages}, version="v2"):
                    kind = event["event"]
                    with open("debug_graph.log", "a") as f:
                        f.write(f"DEBUG: Graph Event: {kind} - {event.get('name', 'no_name')}\n")
                    
                    if kind == "on_chat_model_stream":
                        content = event["data"]["chunk"].content
                        if content:
                            full_response += content
                            yield f"data: {json.dumps({'content': content})}\n\n"
                    elif kind == "on_tool_start":
                        tool_name = event["name"]
                        print(f"DEBUG: Tool start: {tool_name}")
                        yield f"data: {json.dumps({'tool': tool_name})}\n\n"

            print(f"DEBUG: Stream finished. Total length: {len(full_response)}")
            if current_user and full_response:
                content_to_save = latest_msg.content
                if request.image:
                    content_to_save = f"[Image Uploaded] {latest_msg.content}"

                await history_collection.insert_one({
                    "user_email": current_user,
                    "session_id": session_id,
                    "role": "user",
                    "content": content_to_save,
                    "timestamp": datetime.utcnow()
                })
                await history_collection.insert_one({
                    "user_email": current_user,
                    "session_id": session_id,
                    "role": "assistant",
                    "content": full_response,
                    "timestamp": datetime.utcnow()
                })

        except Exception as e:
            import traceback
            print(f"ERROR in streaming: {e}")
            traceback.print_exc()
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

