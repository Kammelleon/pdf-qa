import hashlib
from pathlib import Path
from typing import Union


def calculate_file_hash(file_path: Union[str, Path]) -> str:
    """
    Calculate SHA-256 hash of a file to uniquely identify it.
    
    Args:
        file_path: Path to the file to hash
        
    Returns:
        str: SHA-256 hash of the file
    """
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        # Read and update hash in chunks of 4K
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()
