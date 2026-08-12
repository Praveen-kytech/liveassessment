$ErrorActionPreference = "Stop"
Write-Host "Cleaning up old alembic..."
.\venv\Scripts\python -c "import shutil, os; shutil.rmtree('alembic', ignore_errors=True); os.remove('alembic.ini') if os.path.exists('alembic.ini') else None"

Write-Host "Initializing alembic..."
.\venv\Scripts\python -m alembic init -t async alembic

Write-Host "Configuring alembic..."
.\venv\Scripts\python config_alembic.py

Write-Host "Generating initial migration..."
# We need to create a dummy env if running alembic directly from python fails?
# Let's just run it
.\venv\Scripts\python -m alembic revision --autogenerate -m "Initial migration"
Write-Host "Done!"
