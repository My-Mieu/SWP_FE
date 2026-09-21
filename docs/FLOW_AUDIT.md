# SHARELOOP — audit business flow

Ngày audit: 2026-09-21; cập nhật sau P0.1 cùng ngày. Phạm vi: frontend, Redux mock state, route và dữ liệu seed. Bản audit ban đầu là static code trace; P0.1 đã có kiểm chứng domain tự động nhưng chưa phải E2E trình duyệt. Backend/API và xác minh thanh toán thật nằm ngoài prototype; mock chỉ được tính hoàn chỉnh khi state và quy tắc nối xuyên màn hình.

Quy ước: ✅ COMPLETE = UI + state + rule + transition + mock persistence + liên kết; 🟡 PARTIAL = có đoạn chạy nhưng thiếu bước; ❌ MISSING = chưa triển khai; 🔴 INCORRECT = logic hiện tại trái yêu cầu hoặc có đường bypass. `approved` là trạng thái public hiện tại; không đồng nghĩa toàn bộ vòng đời ACTIVE/RESERVED. Dòng dưới đây dùng đường dẫn tương đối và số dòng của bản audit.

| Flow | Requirement | Status | Evidence | Missing/Problem |
|------|-------------|--------|----------|-----------------|
| 1 | Đăng ký → email OTP → phone OTP → kích hoạt | 🔴 INCORRECT | `src/pages/auth/Register.tsx:7-24,39-99`; `src/app/store.ts:24-60`; `src/types/domain.ts:20-40` | Chỉ có một màn OTP phone, bất kỳ mã nào (kể cả rỗng) cũng tạo user; không có email đầu vào, password đầu vào, resend, mã OTP, `emailVerified`/`phoneVerified` hay trạng thái unverified. Email tự tạo `@example.com`, password cố định. |
| 1 | Login, session, profile, logout, guard | 🟡 PARTIAL | `src/pages/auth/Login.tsx:13-27`; `src/pages/user/Profile.tsx:18-33,82-129,243-272`; `src/routes/Guards.tsx:9-24`; `src/utils/storage.ts:4-29`; `src/layouts/AppShell.tsx:119-124` | Login/profile/logout và localStorage hoạt động; profile không validation/verify khi đổi email-phone; lịch sử uy tín là text giả. Password plaintext và session chỉ là `currentUserId` localStorage, không bảo mật. |
| 2 | Ba số dư, giá 1 Credit = 1.000đ | 🟡 PARTIAL | `src/types/domain.ts:30-35`; `src/utils/credit.ts`; `src/pages/user/Credit.tsx:82-107`; `src/layouts/AppShell.tsx:69` | Tách total/available/hold; P0.1 kiểm tra nonnegative, safe integer và invariant sau Redux mutation. Header hiện available, trang ví hiện cả ba. Vẫn chỉ là mock client-side. |
| 2 | QR → pending → admin confirm → cộng một lần, ledger | 🟡 PARTIAL | `src/pages/user/Credit.tsx`; `src/app/store.ts`; `src/pages/admin/AdminPages.tsx:549-614` | P0.1 chặn VND không dương/không bội 1.000, trùng topup ID/code/ref, xác nhận lặp; admin session/role bắt buộc, adjustment âm không vượt available, ledger có ref. QR vẫn là hình mẫu; chưa có payment verification/reject/failed action; UI lịch sử chưa hiển thị ref/ID. |
| 3 | Form đăng, ảnh, GIVE/SWAP, duyệt hai tầng | 🔴 INCORRECT | `src/pages/user/Post.tsx:22-41,76-140`; `src/app/store.ts:62-73,125-148`; `src/pages/admin/AdminPages.tsx:127-211` | Thiếu ảnh vẫn chèn ảnh Unsplash; không có hard-block từ khóa/nội dung/category/district ở reducer; `forbidden_keywords` chỉ config seed. Admin có list/tóm tắt, approve/reject trực tiếp, không checklist, chi tiết riêng, lý do reject hay moderation record. |
| 3 | Chỉ bài được duyệt hiển thị công khai | 🟡 PARTIAL | `src/pages/public/Home.tsx:133-145`; `src/pages/public/Browse.tsx:29-38`; `src/pages/public/AI.tsx:35-49`; `src/pages/public/ProductDetail.tsx:19-24,89-100` | Các danh sách lọc approved và nút request chặn status khác; truy cập thẳng `/product/:id` vẫn xem được cả pending/rejected/removed, không kiểm tra expiry theo thời gian. |
| 4 | Search/detail/request → owner chọn 1 → transaction | 🔴 INCORRECT | `src/pages/public/Browse.tsx:29-38`; `src/pages/public/ProductDetail.tsx:28-34`; `src/app/store.ts` (`createTransaction`); `src/pages/user/Activities.tsx:22-23,129-185` | Search theo quận hoạt động, nhưng request tạo transaction + conversation ngay; không có Request entity/list, owner accept/reject/chọn một, trade không gắn món phía requester; nhiều request cùng item có thể thành nhiều tx. P0.1 đã yêu cầu item approved và requester là session active; expiry/lock item vẫn thiếu. |
| 4 | Ba chốt kiểm tra Credit | 🔴 INCORRECT | `src/app/store.ts:150-186,207-220,231-245`; `src/utils/credit.ts:50-65,105-129` | CHECK 1 lúc gửi request: không. CHECK 2 lúc chọn partner/tạo tx: không (cũng không có chọn partner). CHECK 3 tại hold sau xác nhận lịch: kiểm tra `availableCredit < fee` cho người thao tác; lúc spend không recheck (đã hold). Đây là **một** chốt thực tế, không phải ba. |
| 5 | Chat riêng, lịch hai bên, hold/charge/release | 🟡 PARTIAL | `src/app/store.ts`; `src/pages/user/Messages.tsx:27-50,60-80,122-209,239-445`; `src/utils/credit.ts` | Mỗi tx có convId/transactionId và item/partner động; lịch lưu Redux. P0.1 đã chặn actor lạ, tự accept lịch, hold của người không chịu phí và chat vào conv không thuộc mình; hold/spend/release dùng ref chống lặp. Chưa có bước owner chọn request/item lock; lỗi thiếu Credit bị no-op ở domain và UI chưa giải thích. |
| 5 | State machine/fee an toàn | 🟡 PARTIAL | `src/utils/transaction.ts`; `src/app/store.ts`; `src/utils/credit.ts`; `scripts/verify-domain.mjs` | P0.1 áp dụng canonical transitions, COMPLETED terminal, cancel/spend/release idempotent, nonnegative wallet; 8 ca kiểm chứng đạt. Vẫn chưa có action tranh chấp hoặc quy tắc refund tranh chấp; UI chưa có thông báo khi action bị từ chối. |
| 6 | Evidence → xác nhận hai phía → completed | 🟡 PARTIAL | `src/pages/user/Messages.tsx:392-443`; `src/types/domain.ts:72-90`; `src/app/store.ts`; `src/utils/credit.ts` | Ảnh/video data URL và boolean hai phía lưu theo tx; fee spend khi cả hai. P0.1 yêu cầu đúng participant/state; seed `tx_001` chuyển WAITING_HANDOVER cho khớp hai payer đã hold (có migration persisted state). Evidence không bắt buộc, không timestamp từng tệp/xác nhận; chưa cập nhật Item/reward/stars. |
| 6 | Report/dispute/resolution/TrustStars | ❌ MISSING | `src/types/domain.ts:135-144`; `src/mocks/database.ts:664-676`; `src/pages/admin/AdminPages.tsx:796-800`; `src/pages/user/Profile.tsx:243-272` | Có interface + mảng disputes rỗng và trang admin đọc mảng, nhưng không action tạo report/dispute, chuyển DISPUTED, resolution, trừ/khôi phục sao, reason/history/audit tương ứng. Không có report listing/user/transaction. |
| 7 | AI two-way swap matching | 🔴 INCORRECT | `src/pages/public/AI.tsx:22-49,142-233` | Mode “have” lọc một chiều category, không so món user có với `tradeFor` của hai bên, không bắt buộc approved trade (có thể hiện gift), không tạo/gắn món user đăng. Tối đa 5 chứ không bảo đảm 3–5 phù hợp. |
| 7 | `/ai` assistant ngôn ngữ tự nhiên, ảnh → mô tả → đề nghị | 🟡 PARTIAL | `src/app/router.tsx:37-40`; `src/pages/public/AI.tsx:28-67,98-139,160-228` | Cùng Item dataset, parse district và vài từ khóa type; category không parse, từ khóa item chỉ special-case “xe đạp”; nút “Phân tích nhu cầu” không handler. Ảnh + description chỉ local, mô tả cố định, không xác nhận/tạo Item; đề nghị gọi createTransaction trực tiếp và có thể là gift. |
| 8 | Admin content/users/transactions/config/log | 🟡 PARTIAL | `src/app/router.tsx:60-86`; `src/pages/admin/AdminPages.tsx:127-211,215-393,396-547,616-827` | Có duyệt, list user/lock/unlock, tx list/detail, fee setting, audit log. Category/district/keywords/ranks/expired/disputes/alerts chủ yếu bảng read-only hoặc dữ liệu giả; không có xử lý tranh chấp/report, sao, expiry, checklist; user detail có điều chỉnh Credit nhưng không TrustStars. |
| 8 | Finance/permission | 🟡 PARTIAL | `src/pages/admin/AdminPages.tsx:549-614`; `src/routes/Guards.tsx`; `src/app/store.ts` | Finance chỉ tổng Credit/hold/pending và topup list; thiếu tiền thực thu, fee theo loại, date range/tuần/tháng/quý/export, ledger từng user đầy đủ. P0.1 kiểm tra admin active/session/role tại reducer mutations liên quan; đây vẫn là client-side mock, không phải authorization server. |
| 9 | Renew, GIVE→SWAP, stars recovery | 🟡 PARTIAL | `src/app/store.ts:76-117`; `src/pages/user/Activities.tsx:79-112,187-230` | Renew +2 tháng và đưa về pending để duyệt lại; không có gần hết hạn cảnh báo/điều kiện. Form sửa không đổi type; không có GIVE→SWAP hoặc recovery stars. |
| 10 | Alert, CSV, ACTIVE→EXPIRED/admin xử lý | 🟡 PARTIAL | `src/pages/admin/AdminPages.tsx:783-810`; `src/types/domain.ts:5`; `src/app/store.ts:98-108` | “Alert” coi nhiều bên hold ở cùng trade là bất thường dù đây là quy tắc bình thường; không phát hiện account liên quan. Không CSV. Có `expired` type/bảng nhưng không job/action tự động quá hạn hay archive/remove từ admin. |
| 11 | Q&A chatbot, review/rating, leaderboard, điểm hẹn, regional stats | ❌ MISSING | `src/app/router.tsx:30-93`; `src/types/domain.ts:164-177`; `src/pages/public/AI.tsx:17-235`; `src/pages/public/Home.tsx:146-149,341-355` | `/ai` là tìm đồ, không phải chatbot Q&A; không entity/action review/rating/leaderboard/meeting point. Home có đếm item theo vài quận, không phải thống kê giao dịch/khu vực. |

## Diễn giải theo flow và đề xuất (chưa triển khai)

1. **Tài khoản.** Login, hồ sơ (name/email/phone/district/avatar/rank/reward/stars), logout và session mock chạy chung `users`/`currentUserId`. Đăng ký xác minh là sai thực chất; thêm input email/password, validation uniqueness/format, OTP email + phone có mã/hạn/resend, verified flags và chỉ kích hoạt sau hai bước. P0.1 đã từ chối/xóa session của user locked ở guard; vẫn thiếu auth server.
2. **Credit.** Ba số dư và lịch sử nằm cùng Redux; topup pending→completed và ledger cập nhật. Bổ sung xác thực amount/idempotency độc lập id, các trạng thái reject, guard nonnegative, ledger ref/metadata hiển thị; QR mock phải ghi rõ không phải thanh toán thật. Giữ Reward Points/rank/stars tách biệt. `src/pages/user/Profile.tsx:131-240` còn một topup UI cũ dùng cùng action nhưng mã chuyển khoản khác `/credit`.
3. **Đăng bài.** Form đưa Item pending, admin approve, Home/Browse thấy approved. Thiết kế hard-block tại domain action dùng config chung, validate ảnh thật/field/category/district và trạng thái BLOCKED hoặc lỗi rõ; moderation checklist + lý do reject + log. Bảo vệ detail URL và hết hạn.
4. **Request/match.** Browse/filter/detail nối item chung, nhưng request lập tức thành tx. Cần Request PENDING→ACCEPTED/REJECTED/CANCELLED, owner chỉ chọn một (atomic), trade chỉ rõ item đối ứng đã approved, kiểm tra Credit ở ba chốt domain, xử lý duplicate/double click, khóa/giữ item cho tx được chọn.
5. **Chat/lịch/phí.** Conv riêng và handover persisted là phần chạy được. P0.1 đã thêm actor/state guards, đối tác mới đồng ý lịch, chỉ payer hold, chỉ complete khi đủ payer, cancel/release không sau spend. Cần UI phản hồi lỗi thiếu Credit (domain hiện từ chối an toàn nhưng no-op) và Request/item lock ở P0 tiếp theo.
6. **Bàn giao/uy tín.** Confirmation và evidence data URL có, hoàn tất thu fee. Thêm timestamp/evidence policy, report theo mục tiêu, dispute action + admin resolution/refund/charge, item lifecycle và hậu giao dịch reward/stars/history/log tách Credit.
7. **AI.** `/ai` dùng dữ liệu Item chung nhưng matching chưa hai chiều. Parse category/query phổ quát; swap chỉ approved trade và yêu cầu item nguồn đã đăng/được duyệt, kiểm tra nhu cầu hai bên; ảnh/mô tả xác nhận phải đi vào Item thật trước khi đề nghị. Không tính nút hoặc copy cố định là AI hoạt động.
8. **Admin.** Guard route có; bảng nhiều mục chỉ trình bày. Chuyển config/category/keyword/district/rank từ static sang state/action có role check, thêm dispute/report/expiry/TrustStars workflows, tài chính từ topup và ledger có bộ lọc thời gian/user/fee, audit log mọi mutation.
9. **Optional.** Renew hiện luôn pending kể cả removed; thêm điều kiện trạng thái và thông báo gần hạn. Đổi gift→trade phải tái duyệt; recovery stars cần policy một lần và history.
10. **Optional.** Thay cảnh báo hold hai phía bằng tín hiệu bất thường thực; thêm CSV và expiry transition/job + admin actions.
11. **Optional.** Chatbot hỏi đáp, review/rating, leaderboard/điểm hẹn và thống kê khu vực chưa có domain flow; chỉ làm sau completion đáng tin cậy.

## Entity / state audit

`EXISTS` nghĩa là có schema/state và ít nhất một đường sử dụng, **không** khẳng định flow hoàn chỉnh; `PARTIAL` là chỉ gộp trong entity khác hoặc read-only; `MISSING` là không có model/action tương ứng.

| Entity | Mức | Implementation / giới hạn |
|---|---|---|
| User | EXISTS | `src/types/domain.ts:20-40`, `src/mocks/database.ts:13-112`, `src/app/store.ts:12-60` |
| Profile | PARTIAL | Fields trong User; `src/pages/user/Profile.tsx:18-129`, không verification riêng |
| Wallet | EXISTS | Ba fields User; `src/utils/credit.ts:18-24`, `src/pages/user/Credit.tsx:82-107` |
| CreditLedger | EXISTS | `CreditHistory`; `src/types/domain.ts:112-121`, `src/utils/credit.ts:26-47,50-129`, `src/app/store.ts:291-334` |
| Topup | EXISTS | `src/types/domain.ts:123-133`, `src/app/store.ts:264-310` |
| Item | EXISTS | `src/types/domain.ts:42-56`, `src/app/store.ts:62-108` |
| ItemModeration | PARTIAL | status trên Item + audit log; `src/app/store.ts:125-148`; không record/checklist/reason |
| Request | MISSING | `createTransaction` trực tiếp `src/app/store.ts:150-186` |
| Transaction | EXISTS | `src/types/domain.ts:72-90`, `src/app/store.ts:150-245` |
| Conversation | EXISTS | `src/types/domain.ts:92-100`, `src/app/store.ts:168-185` |
| Message | EXISTS | `src/types/domain.ts:102-110`, `src/app/store.ts:247-261` |
| Schedule/Handover | EXISTS | `src/types/domain.ts:58-70`, `src/app/store.ts:188-214` |
| Evidence | PARTIAL | String data URLs trong Transaction; `src/types/domain.ts:84-85`, không record/timestamp riêng |
| Report | MISSING | Không model/action report; admin disputes chỉ đọc |
| Dispute | PARTIAL | `src/types/domain.ts:135-144`, seed `disputes: []` `src/mocks/database.ts:665-666`; không tạo/xử lý |
| TrustStarsHistory | MISSING | Chỉ `User.reputationStars`; `src/types/domain.ts:34` |
| RewardHistory | MISSING | Chỉ `User.rewardPoints`; `src/types/domain.ts:33` |
| AI Match | PARTIAL | Kết quả useMemo local; `src/pages/public/AI.tsx:35-49`, không entity/2-way |
| AdminAuditLog | EXISTS | `src/types/domain.ts:146-154`, `src/app/store.ts:137-146,299-309,325-333,342-369` (không bao phủ mọi action) |
| SystemConfig | PARTIAL | `settings` có tx fee/keywords; categories/districts/ranks là constants/read-only; `src/mocks/database.ts:678-693`, `src/constants/domain.ts:15-44` |

## State machine audit

| Entity | Mapping hiện tại | Vấn đề transition |
|---|---|---|
| Item | `pending`≈PENDING_REVIEW → `approved`≈ACTIVE/public hoặc `rejected`; `expired`, `removed` có trong type | Không DRAFT/BLOCKED/RESERVED/COMPLETED, không auto expiry. `updateItemStatus` nhận mọi status không guard (`src/app/store.ts:125-148`); update/renew đưa pending từ bất cứ status (`:76-108`). |
| Request | Không tồn tại | Không PENDING/ACCEPTED/REJECTED/CANCELLED, owner không chọn. |
| Transaction | `NEGOTIATING` → `SCHEDULE_PROPOSED` → `SCHEDULE_CONFIRMED` → `CREDIT_HELD` (payer đầu) → `WAITING_HANDOVER` (đủ payer; gift đi qua CREDIT_HELD trong cùng action) → `SENDER_CONFIRMED`/`RECEIVER_CONFIRMED` → `COMPLETED`; `CANCELLED`, `DISPUTED` type | P0.1 dùng `canTransition`/`transitionTransaction`, COMPLETED terminal, confirm/cancel guard; seed/persisted `tx_001` đủ payer đã normalize WAITING_HANDOVER. Chưa có action `DISPUTED`/resolution. |
| Topup | `pending` → `completed` qua admin; `confirming`, `failed` trong type | Không action chuyển confirming/failed/rejected, chưa validate amount/ID (`src/app/store.ts:264-310`). |
| Handover | `proposed` → `confirmed` | Chỉ kiểm tra tx status, không kiểm tra người đồng ý là đối tác (`src/app/store.ts:207-214`). |

## Cross-flow trace

`Post.addItem` → cùng `items` pending → `AdminModeration.updateItemStatus` approved → Home/Browse/AI lọc cùng `items` → ProductDetail `createTransaction` → cùng `transactions` + `conversations` + `messages` → Messages đề xuất/accept `handovers` → `holdFee`/`creditHistory` → hai xác nhận → `spendHeldFee`/COMPLETED → Credit history và AdminTransactions/AdminFinance đọc cùng state. `src/utils/storage.ts` persist state vào một localStorage key. Đây là lõi xuyên trang thực, không phải mỗi trang mock riêng. P0.1 đã xử lý actor guards và cancel sau completion; chuỗi vẫn đứt ở Request/owner selection, moderation hard-block và hậu giao dịch TrustStars/reward/finance. Storage còn merge lại seedItems bị thiếu; UI `Messages` chọn conversation đầu khi mount, link từ transaction không truyền transactionId nên có thể mở sai chat dù dữ liệu conv riêng đúng.

## A. REQUIRED FLOW SUMMARY

| Flow | Kết luận |
|---|---|
| 1 Auth/profile | 🟡 PARTIAL (OTP là điểm 🔴 INCORRECT) |
| 2 Credit | 🟡 PARTIAL |
| 3 Listing/moderation | 🔴 INCORRECT |
| 4 Request/matching/3 checks | 🔴 INCORRECT |
| 5 Chat/schedule/fee | 🟡 PARTIAL (P0.1 đã sửa cancel/spend/state guards; request vẫn thiếu) |
| 6 Handover/dispute/stars | 🟡 PARTIAL (dispute/stars ❌ MISSING) |
| 7 AI matching/assistant | 🔴 INCORRECT |
| 8 Admin/finance | 🟡 PARTIAL |

**Tổng sau P0.1: 0 COMPLETE, 5 PARTIAL, 0 MISSING toàn flow, 3 INCORRECT** (các nhánh MISSING nằm trong flow partial/incorrect).

## B. OPTIONAL FLOW SUMMARY

| Flow | Kết luận |
|---|---|
| 9 Renew/conversion/stars | 🟡 PARTIAL |
| 10 Alert/CSV/expiry | 🟡 PARTIAL |
| 11 Chatbot/review/ranking | ❌ MISSING |

## C. CRITICAL GAPS

1. Không có Request và bước owner chọn một partner; transaction được tạo ngay, duplicate/race và nhiều giao dịch trên cùng Item (`src/app/store.ts:150-186`).
2. Credit mới check tại hold (chưa đủ ba chốt request/accept/hold); P0.1 đã chặn cancel sau COMPLETED, số dư âm, duplicate spend/release và actor lạ (`src/utils/credit.ts`, `src/app/store.ts`).
3. Đăng bài không hard-block và admin thiếu checklist/reject reason; detail URL không hạn chế non-approved (`src/pages/user/Post.tsx:22-41`, `src/pages/admin/AdminPages.tsx:127-211`, `src/pages/public/ProductDetail.tsx:19-24`).
4. Không có dispute/report/resolution và evidence timestamp; completion không cập nhật Item, Reward Points, TrustStars/history (`src/app/store.ts:221-245`, `src/types/domain.ts:72-90,135-144`).
5. Auth OTP vẫn giả; P0.1 đã kiểm tra actor/admin và session locked ở client nhưng chưa có auth/authorization backend đáng tin cậy (`src/pages/auth/Register.tsx:16-24`, `src/routes/Guards.tsx`, `src/app/store.ts`).

## D. IMPLEMENTATION PLAN (đề xuất, chưa sửa)

**P0 — chạy end-to-end an toàn:** (1) **P0.1 đã triển khai** domain actor/status/role, ID/ref/idempotency, invariant nonnegative, kiểm chứng tám ca, chặn cancel sau spend. (2) Còn lại: hard-block listing + moderation/checklist/approve/reject reason; bảo vệ public detail/expiry. (3) Request entity và owner accept một người, khóa Item, trade item đối ứng. (4) Ba Credit checks tại request, accept/lock, trước hold/charge; UI báo insufficient balance và xử lý duplicate request. (5) Bằng chứng + timestamp, completion cập nhật Item, ledger và admin report nền tảng.

### Kết quả kiểm chứng P0.1

`scripts/verify-domain.mjs` kiểm tra 8 ca bắt buộc: hold→spend, hold→cancel, cancel sau COMPLETED, double spend, double release, unrelated actor, adjustment âm quá available, confirm topup hai lần. Domain hiện từ chối mutation không hợp lệ bằng no-op (không báo lỗi UI). `npm run lint` và `npm run build` được chạy lại sau thay đổi; chưa có E2E trình duyệt.

**P1 — hoàn thiện REQUIRED:** (6) Email/phone OTP mock thật, resend, verified state/validation/session policy. (7) Report/dispute/admin resolution/refund và TrustStars/Reward histories có lý do/log. (8) Two-way approved trade matching và assistant parse category/district/type, ảnh/mô tả xác nhận vào Item thật. (9) Admin config/content/finance theo ledger, fee type/date/user/week/month/quarter, phân quyền action; topup reject và lịch sử có ref.

**P2 — OPTIONAL:** (10) Renew cảnh báo/điều kiện, gift→trade re-review, stars recovery policy. (11) Expiry job/admin xử lý, abnormal multi-account alerts, CSV. (12) Q&A chatbot, post-transaction review/rating, leaderboard, điểm hẹn và thống kê khu vực.
