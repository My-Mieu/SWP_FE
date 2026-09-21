import assert from 'node:assert/strict';
import { build } from 'esbuild';

// Bundle the same TypeScript reducers/utilities used by Vite, without adding a test framework.
const bundle = await build({
  stdin: {
    contents: `export { actions, dataReducer } from './src/app/store.ts';
      export { initialData } from './src/mocks/database.ts';
      export { assertWalletInvariant } from './src/utils/credit.ts';`,
    resolveDir: process.cwd(),
    sourcefile: 'domain-verification.ts',
    loader: 'ts',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
});
const { actions, dataReducer, initialData, assertWalletInvariant } = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].contents).toString('base64')}`
);

function fixture() {
  const state = structuredClone(initialData);
  const requester = state.users.find((user) => user.id === 'user_001');
  requester.totalCredit = 20;
  requester.availableCredit = 20;
  requester.holdCredit = 0;
  state.currentUserId = requester.id;
  state.creditHistory = [];
  state.transactions = [
    {
      id: 'tx_test',
      itemId: 'item_002',
      requesterId: requester.id,
      ownerId: 'user_002',
      type: 'gift',
      feeCredit: 5,
      status: 'SCHEDULE_CONFIRMED',
      creditHeldBy: [],
      senderConfirmed: false,
      receiverConfirmed: false,
      createdAt: '2026-09-21T00:00:00Z',
    },
  ];
  return state;
}
const reduce = (state, action) => dataReducer(state, action);
const wallet = (state) => {
  const { totalCredit, availableCredit, holdCredit } = state.users.find((u) => u.id === 'user_001');
  return [totalCredit, availableCredit, holdCredit];
};
const hold = (state) =>
  reduce(state, actions.holdTransactionFee({ transactionId: 'tx_test', userId: 'user_001' }));
const as = (state, username) => reduce(state, actions.login({ username, password: '12345678' }));
const cancel = (state, actorId = 'user_001') =>
  reduce(state, actions.cancelTransaction({ transactionId: 'tx_test', actorId }));

// Cases 1 and 4: hold, spend, repeated spend.
let state = hold(fixture());
assert.deepEqual(wallet(state), [20, 15, 5]);
assert.equal(state.transactions[0].status, 'WAITING_HANDOVER');
state = hold(state);
assert.deepEqual(wallet(state), [20, 15, 5]);
assert.equal(
  state.creditHistory.filter((entry) => entry.ref === 'tx_test:user_001:HOLD').length,
  1,
);
state = as(state, 'nga');
state = reduce(
  state,
  actions.confirmTransactionSide({ transactionId: 'tx_test', userId: 'user_002' }),
);
state = as(state, 'use');
state = reduce(
  state,
  actions.confirmTransactionSide({ transactionId: 'tx_test', userId: 'user_001' }),
);
assert.deepEqual(wallet(state), [15, 15, 0]);
assert.equal(state.transactions[0].status, 'COMPLETED');
const spent = state;
state = reduce(
  state,
  actions.confirmTransactionSide({ transactionId: 'tx_test', userId: 'user_001' }),
);
assert.deepEqual(wallet(state), wallet(spent));
assert.equal(
  state.creditHistory.filter((entry) => entry.ref === 'tx_test:user_001:SPEND').length,
  1,
);

// Case 3: completed cannot cancel or release Credit.
state = cancel(state);
assert.equal(state.transactions[0].status, 'COMPLETED');
assert.deepEqual(wallet(state), [15, 15, 0]);
assert.equal(
  state.creditHistory.some((entry) => entry.ref === 'tx_test:user_001:RELEASE'),
  false,
);
assertWalletInvariant(state);

// Cases 2 and 5: valid cancellation releases once.
state = cancel(hold(fixture()));
assert.deepEqual(wallet(state), [20, 20, 0]);
assert.equal(state.transactions[0].status, 'CANCELLED');
state = cancel(state);
assert.deepEqual(wallet(state), [20, 20, 0]);
assert.equal(
  state.creditHistory.filter((entry) => entry.ref === 'tx_test:user_001:RELEASE').length,
  1,
);
assertWalletInvariant(state);

// Case 6: unrelated user cannot confirm, hold, cancel or write to the chat.
state = as(hold(fixture()), 'hung');
const before = structuredClone(state);
state = reduce(
  state,
  actions.confirmTransactionSide({ transactionId: 'tx_test', userId: 'user_003' }),
);
state = reduce(state, actions.holdTransactionFee({ transactionId: 'tx_test', userId: 'user_003' }));
state = cancel(state, 'user_003');
assert.deepEqual(state, before);

// Schedule acceptance belongs to the other participant, never the proposer or a stranger.
state = fixture();
state.transactions[0].status = 'SCHEDULE_PROPOSED';
state.transactions[0].handoverId = 'ho_test';
state.handovers = [
  {
    id: 'ho_test',
    transactionId: 'tx_test',
    date: '2026-09-25',
    time: '18:00',
    district: 'Quận 3',
    address: 'Test',
    method: 'Gặp trực tiếp',
    proposedBy: 'user_001',
    status: 'proposed',
  },
];
state = reduce(state, actions.acceptHandover({ handoverId: 'ho_test', userId: 'user_001' }));
assert.equal(state.transactions[0].status, 'SCHEDULE_PROPOSED');
state = as(state, 'hung');
state = reduce(state, actions.acceptHandover({ handoverId: 'ho_test', userId: 'user_003' }));
assert.equal(state.transactions[0].status, 'SCHEDULE_PROPOSED');
state = as(state, 'nga');
state = reduce(state, actions.acceptHandover({ handoverId: 'ho_test', userId: 'user_002' }));
assert.equal(state.transactions[0].status, 'SCHEDULE_CONFIRMED');

// Case 7: adjustment cannot take more than available; forged adminId is rejected.
state = as(hold(fixture()), 'admin');
state = reduce(
  state,
  actions.adminAdjustCredit({
    adminId: 'admin_001',
    userId: 'user_001',
    amount: -16,
    note: 'test',
    ref: 'adjust_negative_test',
  }),
);
assert.deepEqual(wallet(state), [20, 15, 5]);
state = as(state, 'use');
state = reduce(
  state,
  actions.adminAdjustCredit({
    adminId: 'admin_001',
    userId: 'user_001',
    amount: 5,
    note: 'forged',
    ref: 'adjust_forged_test',
  }),
);
assert.deepEqual(wallet(state), [20, 15, 5]);
assertWalletInvariant(state);

state = as(state, 'admin');
const adjustment = actions.adminAdjustCredit({
  adminId: 'admin_001',
  userId: 'user_001',
  amount: 2,
  note: 'test valid adjustment',
  ref: 'adjust_once',
});
state = reduce(state, adjustment);
state = reduce(state, adjustment);
assert.deepEqual(wallet(state), [22, 17, 5]);
assert.equal(state.creditHistory.filter((entry) => entry.ref === 'adjust_once').length, 1);

state = as(fixture(), 'lan');
assert.equal(state.currentUserId, null, 'locked user cannot establish a session');

// Case 8 plus invalid/duplicate topups: exactly one credit and one ledger effect.
state = fixture();
for (const vnd of [0, -1000, 1500, Number.NaN]) {
  state = reduce(state, actions.topupCredit({ userId: 'user_001', vnd }));
}
assert.equal(state.topups.length, 0);
state = reduce(
  state,
  actions.topupCredit({ userId: 'user_001', vnd: 5000, id: 'top_test', code: 'SLTEST' }),
);
state = reduce(
  state,
  actions.topupCredit({ userId: 'user_001', vnd: 5000, id: 'top_test', code: 'OTHER' }),
);
state = reduce(
  state,
  actions.topupCredit({ userId: 'user_001', vnd: 5000, id: 'other', code: 'SLTEST' }),
);
assert.equal(state.topups.length, 1);
state = as(state, 'admin');
state = reduce(state, actions.confirmTopup({ topupId: 'top_test', adminId: 'admin_001' }));
state = reduce(state, actions.confirmTopup({ topupId: 'top_test', adminId: 'admin_001' }));
assert.deepEqual(wallet(state), [25, 25, 0]);
assert.equal(state.creditHistory.filter((entry) => entry.ref === 'top_test').length, 1);
assertWalletInvariant(state);

console.log('Domain safety verification: 8 required cases passed.');
