import os
import re

alembic_ini_path = r"d:\poc\backend\alembic.ini"
env_py_path = r"d:\poc\backend\alembic\env.py"

if os.path.exists(alembic_ini_path):
    with open(alembic_ini_path, "r") as f:
        content = f.read()
    
    # modify sqlalchemy.url
    content = re.sub(
        r"sqlalchemy\.url\s*=.*",
        "sqlalchemy.url = sqlite+aiosqlite:///./live_assessment.db",
        content
    )
    with open(alembic_ini_path, "w") as f:
        f.write(content)

if os.path.exists(env_py_path):
    with open(env_py_path, "r") as f:
        content = f.read()
    
    # Ensure it handles sqlite async execution properly
    # env.py for alembic async needs special treatment for sqlite? 
    # Not really, but sqlite doesn't support some ALTER TABLE so we enable render_as_batch
    content = content.replace(
        "context.configure(",
        "context.configure(\n    render_as_batch=True,"
    )
    with open(env_py_path, "w") as f:
        f.write(content)
