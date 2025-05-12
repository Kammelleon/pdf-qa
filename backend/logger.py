import logging
import datetime
from logging import Logger
from logging.handlers import RotatingFileHandler
from pathlib import Path


def setup_logging() -> None:
    logs_dir = Path(__file__).parent / "logs"
    logs_dir.mkdir(exist_ok=True)

    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    run_dir = logs_dir / f"run_{timestamp}"
    run_dir.mkdir(exist_ok=True)

    log_file = run_dir / "app.log"

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)

    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    file_handler = RotatingFileHandler(
        log_file,
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=10,  # Keep up to 10 backup files
    )
    file_handler.setFormatter(formatter)
    root_logger.addHandler(file_handler)

    root_logger.info(f"Logging initialized. Log files will be stored in {run_dir}")

setup_logging()

def get_logger(name: str) -> Logger:
    return logging.getLogger(name)
