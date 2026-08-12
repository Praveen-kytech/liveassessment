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
        "sqlalchemy.url = postgresql+asyncpg://user:password@localhost:5432/live_assessment",
        content
    )
    with open(alembic_ini_path, "w") as f:
        f.write(content)

if os.path.exists(env_py_path):
    with open(env_py_path, "r") as f:
        content = f.read()

    # Need to add imports for models
    imports = "from app.models.base import Base\nfrom app.models import *\n"
    
    # modify target_metadata
    content = content.replace("target_metadata = None", f"{imports}\ntarget_metadata = Base.metadata")
    
    with open(env_py_path, "w") as f:
        f.write(content)
