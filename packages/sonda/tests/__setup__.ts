import { afterEach } from 'vitest';
import { rmSync } from 'fs';
import { join } from 'path';

afterEach(() => {
	rmSync(join(import.meta.dirname, 'dist'), { recursive: true, force: true });
});
