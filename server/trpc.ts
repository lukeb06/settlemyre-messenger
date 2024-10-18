import { initTRPC } from '@trpc/server';
import type { Context } from './authorization';

import type { User } from './ms-database';

type Env = {
	user: User | null;
};

type HonoContext = {
	env: Env;
};

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
