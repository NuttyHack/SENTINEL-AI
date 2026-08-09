---
name: OpenAPI numeric compatibility
description: Compatibility note for generated API validation schemas in this workspace.
---

When extending the OpenAPI contract, prefer `type: number` for whole-number values unless integer-specific validation is essential.

**Why:** The installed generated validation dependency is Zod 3, while the current Orval output can emit `zod.int()` for OpenAPI `integer`, which fails the workspace typecheck. Numeric fields still preserve the intended values for this app's data contracts.

**How to apply:** If integer validation is required, add an explicit compatible refinement strategy rather than assuming the generator's integer helper exists.