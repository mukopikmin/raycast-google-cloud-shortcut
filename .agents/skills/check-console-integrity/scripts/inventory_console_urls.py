#!/usr/bin/env python3
"""Inventory Google Cloud Console URLs in a repository."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Iterator, TypedDict


CONSOLE_ORIGIN = "https://" + "console.cloud.google.com"
URL_PATTERN = re.compile(re.escape(CONSOLE_ORIGIN) + r"[^\s`\"'<>]*")
IGNORED_DIRECTORIES = {
    ".cache",
    ".codex",
    ".git",
    ".hg",
    ".next",
    ".svn",
    "build",
    "coverage",
    "dist",
    "node_modules",
    "out",
    "vendor",
}
TEST_DIRECTORY_NAMES = {"__tests__", "test", "tests"}
TEST_FILE_PATTERN = re.compile(r"\.(?:spec|test)\.[^.]+$")


class ConsoleUrl(TypedDict):
    path: str
    line: int
    column: int
    kind: str
    context: str
    url: str


def is_test_path(path: Path) -> bool:
    return any(part in TEST_DIRECTORY_NAMES for part in path.parts) or bool(TEST_FILE_PATTERN.search(path.name))


def iter_text_files(root: Path) -> Iterator[Path]:
    for current_root, directory_names, file_names in os.walk(root, followlinks=False):
        directory_names[:] = sorted(name for name in directory_names if name not in IGNORED_DIRECTORIES)
        current_path = Path(current_root)
        for file_name in sorted(file_names):
            path = current_path / file_name
            if path.is_symlink() or not path.is_file():
                continue
            yield path


def scan(root: Path) -> list[ConsoleUrl]:
    resolved_root = root.resolve()
    findings: list[ConsoleUrl] = []

    for path in iter_text_files(resolved_root):
        try:
            contents = path.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            continue

        relative_path = path.relative_to(resolved_root)
        context = "test" if is_test_path(relative_path) else "production"
        for line_number, line in enumerate(contents.splitlines(), start=1):
            for match in URL_PATTERN.finditer(line):
                url = match.group(0)
                findings.append(
                    {
                        "path": relative_path.as_posix(),
                        "line": line_number,
                        "column": match.start() + 1,
                        "kind": "dynamic" if "${" in url else "fixed",
                        "context": context,
                        "url": url,
                    }
                )

    return sorted(findings, key=lambda item: (item["path"], item["line"], item["column"], item["url"]))


def write_json(findings: list[ConsoleUrl]) -> None:
    json.dump(findings, sys.stdout, indent=2, ensure_ascii=False)
    sys.stdout.write("\n")


def write_tsv(findings: list[ConsoleUrl]) -> None:
    fields = ("path", "line", "column", "kind", "context", "url")
    sys.stdout.write("\t".join(fields) + "\n")
    for finding in findings:
        sys.stdout.write("\t".join(str(finding[field]) for field in fields) + "\n")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", nargs="?", default=".", type=Path, help="repository root (default: current directory)")
    parser.add_argument("--format", choices=("json", "tsv"), default="json", help="output format (default: json)")
    args = parser.parse_args()
    if not args.root.is_dir():
        parser.error(f"root is not a directory: {args.root}")
    return args


def main() -> None:
    args = parse_args()
    findings = scan(args.root)
    if args.format == "json":
        write_json(findings)
    else:
        write_tsv(findings)


if __name__ == "__main__":
    main()
