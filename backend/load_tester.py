import asyncio
import websockets
import json
import time
import argparse
import random
import statistics

async def load_test_participant(session_id, participant_id, metrics):
    uri = f"ws://localhost:8000/api/live/ws?session_id={session_id}&participant_id={participant_id}&role=participant"
    
    start_time = time.time()
    try:
        async with websockets.connect(uri) as websocket:
            conn_time = time.time() - start_time
            metrics['connections'].append(conn_time)
            
            # Send initial presence heartbeat
            await websocket.send(json.dumps({
                "action": "PRESENCE_HEARTBEAT",
                "timestamp": time.time()
            }))
            
            while True:
                message = await websocket.recv()
                data = json.loads(message)
                
                # If question is released, submit an answer with random human latency
                if data.get("event") == "QUESTION_RELEASED":
                    q_start = time.time()
                    
                    # Human reaction time (0.5s to 3s)
                    await asyncio.sleep(random.uniform(0.5, 3.0))
                    
                    # Submit answer
                    await websocket.send(json.dumps({
                        "action": "SUBMIT_ANSWER",
                        "question_id": data.get("question_id"),
                        "answer_id": random.randint(1, 4),
                        "timestamp": time.time()
                    }))
                    
                    metrics['answers'].append(time.time() - q_start)
                    
                if data.get("event") == "SESSION_ENDED":
                    break
                    
    except Exception as e:
        metrics['errors'].append(str(e))

async def simulate_doctor_release(session_id, num_questions):
    uri = f"ws://localhost:8000/api/live/ws?session_id={session_id}&participant_id=9999&role=doctor"
    
    # Wait for participants to connect
    await asyncio.sleep(2)
    
    try:
        async with websockets.connect(uri) as websocket:
            for i in range(num_questions):
                await asyncio.sleep(5) # release a question every 5 seconds
                print(f"[Doctor] Releasing Question {i+1}...")
                await websocket.send(json.dumps({
                    "action": "RELEASE_QUESTION",
                    "question_id": i + 1,
                    "timestamp": time.time()
                }))
            
            await asyncio.sleep(5)
            print(f"[Doctor] Ending Session...")
            await websocket.send(json.dumps({
                "action": "END_SESSION",
                "timestamp": time.time()
            }))
    except Exception as e:
        print(f"Doctor error: {e}")

async def main(num_participants, num_questions):
    print(f"Starting Load Test with {num_participants} concurrent WebSocket participants.")
    
    session_id = 1
    metrics = {
        'connections': [],
        'answers': [],
        'errors': []
    }
    
    # Spawn doctor
    doctor_task = asyncio.create_task(simulate_doctor_release(session_id, num_questions))
    
    # Spawn participants
    participant_tasks = [
        asyncio.create_task(load_test_participant(session_id, i, metrics)) 
        for i in range(1, num_participants + 1)
    ]
    
    await asyncio.gather(doctor_task, *participant_tasks)
    
    # Print report
    print("\n" + "="*40)
    print("LOAD TEST RESULTS")
    print("="*40)
    print(f"Total Connections: {len(metrics['connections'])}")
    if metrics['connections']:
        print(f"Avg Connection Time: {statistics.mean(metrics['connections']) * 1000:.2f}ms")
    
    print(f"\nTotal Answers Submitted: {len(metrics['answers'])}")
    if metrics['answers']:
        print(f"Avg Response Latency: {statistics.mean(metrics['answers']):.2f}s")
        print(f"P95 Response Latency: {statistics.quantiles(metrics['answers'], n=100)[94]:.2f}s" if len(metrics['answers']) > 1 else "N/A")
        
    print(f"\nErrors encountered: {len(metrics['errors'])}")
    print("="*40)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Live Assessment Load Tester")
    parser.add_argument("--participants", type=int, default=100, help="Number of concurrent participants")
    parser.add_argument("--questions", type=int, default=5, help="Number of questions to simulate")
    args = parser.parse_args()
    
    asyncio.run(main(args.participants, args.questions))
