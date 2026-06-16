import os
from dotenv import load_dotenv
load_dotenv(override=True)

from typing import List
from datetime import datetime
from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, BaseMessage
from langchain_core.tools import tool
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from langchain_community.tools import WikipediaQueryRun, DuckDuckGoSearchRun
from langchain_community.utilities import WikipediaAPIWrapper
from langchain_community.document_loaders import WebBaseLoader
import bs4
from typing_extensions import TypedDict
from models import MessageModel

from typing import List, Annotated
import operator

# LangGraph Setup
class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]

LLM_MODEL = os.getenv("LLM_MODEL", "mistral:7b")
llm = ChatOllama(model=LLM_MODEL, temperature=0.7, streaming=True)

# Tools Setup
# Tools Initialization
wikipedia_tool = WikipediaQueryRun(api_wrapper=WikipediaAPIWrapper())
ddg_search = DuckDuckGoSearchRun()

@tool
async def search(query: str):
    """
    Search the web for real-time information and data.
    ALWAYS synthesize the search results into a clean, factual answer.
    NEVER include URLs or links in your final output unless the user asked for a link.
    """
    try:
        return ddg_search.invoke(query)
    except Exception as e:
        return f"Search error: {str(e)}"

@tool
async def wikipedia(query: str):
    """
    Search Wikipedia for background facts and detailed info.
    ALWAYS provide a direct answer based on the facts found.
    NEVER include URLs or links in your final output.
    """
    try:
        return wikipedia_tool.invoke(query)
    except Exception as e:
        return f"Wikipedia error: {str(e)}"

@tool
async def get_current_datetime():
    """
    REQUIRED tool for any questions about 'today', 'now', 'current time', 'current date', or 'what day is it'.
    Do NOT rely on internal knowledge for the current date or time.
    """
    return datetime.now().strftime("%A, %B %d, %Y %H:%M:%S")

@tool
async def get_system_stats():
    """
    Get system statistics such as total users, total messages, and total sessions.
    Use this when the user asks about the application's data or growth.
    """
    from database import newuser_collection, history_collection
    
    total_users = await newuser_collection.count_documents({})
    total_messages = await history_collection.count_documents({})
    return f"Total Users: {total_users}, Total Messages: {total_messages}"

@tool
async def cricbuzz(query: str):
    """
    Get LIVE cricket scores, news, and match updates.
    Use this for any cricket-related queries about ongoing or upcoming matches in 2024, 2025, or beyond.
    """
    try:
        return ddg_search.invoke(f"site:cricbuzz.com {query}")
    except Exception as e:
        return f"Cricbuzz search error: {str(e)}"

@tool
async def web_scrape(url: str):
    """
    Scrape and read the content of a specific webpage URL.
    Use this after searching to get detailed information from a specific link.
    """
    try:
        loader = WebBaseLoader(
            web_paths=(url,),
            requests_kwargs={"timeout": 10}, # 10 seconds timeout
            bs_kwargs=dict(
                parse_only=bs4.SoupStrainer(
                    class_=("post-content", "post-text", "entry-content", "main-content", "article-body")
                )
            ),
        )
        docs = await loader.aload()
        content = "\n\n".join([doc.page_content for doc in docs])
        return content[:5000] # Limit content to 5000 chars
    except Exception as e:
        return f"Error scraping {url}: {str(e)}"

tools = [wikipedia, search, cricbuzz, get_current_datetime, get_system_stats, web_scrape]
llm_with_tools = llm.bind_tools(tools)

async def chatbot(state: AgentState):
    # Ensure there's always a system message at the start if not already there
    messages = state["messages"]
    if not any(isinstance(m, SystemMessage) for m in messages):
        # This shouldn't happen based on chat.py, but safe to have
        messages = [SystemMessage(content="You are a helpful AI assistant with access to tools.")] + messages
    
    response = await llm_with_tools.ainvoke(messages)
    return {"messages": [response]}

def should_continue(state: AgentState):
    messages = state["messages"]
    last_message = messages[-1]
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    return END

workflow = StateGraph(AgentState)
workflow.add_node("agent", chatbot)
workflow.add_node("tools", ToolNode(tools))

workflow.add_edge(START, "agent")
workflow.add_conditional_edges("agent", should_continue, ["tools", END])
workflow.add_edge("tools", "agent")

graph = workflow.compile()

# Vision setup
VISION_MODEL = os.getenv("VISION_MODEL", "llava")
vision_llm = ChatOllama(model=VISION_MODEL, temperature=0.7, timeout=120, streaming=True)

def convert_to_langchain_messages(messages: List[MessageModel]) -> List[BaseMessage]:
    lc_messages = []
    for m in messages:
        if m.role == "user":
            lc_messages.append(HumanMessage(content=m.content))
        elif m.role == "assistant":
            lc_messages.append(AIMessage(content=m.content))
        elif m.role == "system":
            lc_messages.append(SystemMessage(content=m.content))
    return lc_messages
