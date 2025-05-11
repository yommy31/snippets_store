#!/usr/bin/env python3
"""
Script to run all tests for the Code Snippet Manager backend.
"""

import os
import sys
import pytest


def run_tests():
    """Run all tests."""
    # Add the project root to the Python path
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sys.path.insert(0, project_root)

    # Run tests
    args = [
        "-v",  # Verbose output
        "--cov=app",  # Coverage for app directory
        "--cov-report=term",  # Coverage report in terminal
        "--cov-report=html:coverage_html",  # HTML coverage report
    ]

    # Add test directories
    args.extend(
        [
            "tests/test_models",
            "tests/test_crud",
            "tests/test_api",
        ]
    )

    # Run pytest with the specified arguments
    return pytest.main(args)


if __name__ == "__main__":
    sys.exit(run_tests())
