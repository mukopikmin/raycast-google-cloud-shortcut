#!/usr/bin/env python3

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

import inventory_console_urls as inventory


class InventoryConsoleUrlsTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary_directory.name)
        origin = inventory.CONSOLE_ORIGIN

        (self.root / "src").mkdir()
        (self.root / "src" / "service.ts").write_text(
            f'const fixed = "{origin}/compute/instances";\n'
            f"const dynamic = `{origin}/run/detail/${{region}}/${{encodeURIComponent(name)}}?project=${{projectId}}`;\n",
            encoding="utf-8",
        )
        (self.root / "src" / "service.test.ts").write_text(
            f'const expected = "{origin}/compute/instances?project=sample";\n',
            encoding="utf-8",
        )

        for ignored_directory in ("node_modules", "dist", ".codex"):
            directory = self.root / ignored_directory
            directory.mkdir()
            (directory / "ignored.ts").write_text(f'const url = "{origin}/ignored";\n', encoding="utf-8")

        (self.root / "binary.dat").write_bytes(b"\xff\xfe\x00")

    def tearDown(self) -> None:
        self.temporary_directory.cleanup()

    def test_scan_classifies_and_sorts_findings(self) -> None:
        findings = inventory.scan(self.root)

        self.assertEqual(
            [(item["path"], item["line"], item["kind"], item["context"]) for item in findings],
            [
                ("src/service.test.ts", 1, "fixed", "test"),
                ("src/service.ts", 1, "fixed", "production"),
                ("src/service.ts", 2, "dynamic", "production"),
            ],
        )
        self.assertEqual(findings[1]["column"], 16)
        self.assertTrue(findings[2]["url"].endswith("${encodeURIComponent(name)}?project=${projectId}"))

    def test_json_and_tsv_cli_output(self) -> None:
        script = Path(inventory.__file__)
        json_result = subprocess.run(
            [sys.executable, str(script), str(self.root), "--format", "json"],
            check=True,
            capture_output=True,
            text=True,
        )
        tsv_result = subprocess.run(
            [sys.executable, str(script), str(self.root), "--format", "tsv"],
            check=True,
            capture_output=True,
            text=True,
        )

        self.assertEqual(len(json.loads(json_result.stdout)), 3)
        self.assertEqual(tsv_result.stdout.splitlines()[0], "path\tline\tcolumn\tkind\tcontext\turl")
        self.assertEqual(len(tsv_result.stdout.splitlines()), 4)


if __name__ == "__main__":
    unittest.main()
