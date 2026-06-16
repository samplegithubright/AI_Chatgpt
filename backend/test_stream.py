import requests
import json

def test_chat():
    url = "http://localhost:8000/chat"
    data = {
        "messages": [{"role": "user", "content": "What is 2+2?"}],
        "session_id": None
    }
    
    print(f"Sending request to {url}...")
    try:
        response = requests.post(url, json=data, stream=True, timeout=30)
        print(f"Status Code: {response.status_code}")
        
        for line in response.iter_lines():
            if line:
                decoded_line = line.decode('utf-8')
                print(f"Received: {decoded_line}")
                if "error" in decoded_line:
                    print("ERROR DETECTED IN STREAM")
    except Exception as e:
        print(f"EXCEPTION: {e}")

if __name__ == "__main__":
    test_chat()
