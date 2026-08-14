import psycopg2, json

conn = psycopg2.connect(host='localhost', port=5435, user='postgres', password='Inba2004', dbname='poc')
conn.autocommit = True
cur = conn.cursor()

cur.execute("SELECT id, metadata_json FROM session_events WHERE event_type = 'ANSWER_SUBMITTED'")
events = cur.fetchall()
for event_id, metadata in events:
    if not metadata: continue
    try:
        data = json.loads(metadata)
        if 'participant_id' in data and 'participant_name' not in data:
            p_id = data['participant_id']
            cur.execute('SELECT user_id FROM participants WHERE id = %s', (p_id,))
            p_res = cur.fetchone()
            if p_res:
                cur.execute('SELECT first_name, last_name FROM users WHERE id = %s', (p_res[0],))
                u_res = cur.fetchone()
                if u_res:
                    name = f"{u_res[0]} {u_res[1]}"
                    data['participant_name'] = name
                    cur.execute('UPDATE session_events SET metadata_json = %s WHERE id = %s', (json.dumps(data), event_id))
    except Exception as e:
        print('Error:', e)
print('Done.')
