---
'sonda': patch
---

Updated the Connections graph to primarily flow left-to-right and keep directly linked nodes out of the same column where possible. It should no longer produce backtracking or same-column cross-links except in unavoidable circular dependency cases.
