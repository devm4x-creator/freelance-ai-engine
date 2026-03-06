# دليل إعداد الدفع عبر Chargily - خطوة بخطوة 🇩🇿

## المتطلبات الأساسية

- ✅ حساب Chargily (https://pay.chargily.com)
- ✅ حساب Netlify (للاستضافة)
- ✅ حساب Supabase (لقاعدة البيانات)

---

## الخطوة 1️⃣: الحصول على API Keys من Chargily

### 1. سجّل دخولك لـ Chargily Dashboard

- اذهب إلى: https://pay.chargily.com/test/dashboard
- سجل دخولك بحسابك

### 2. احصل على Secret Key

1. من القائمة الجانبية، اختر **Settings** (الإعدادات)
2. اختر **API Keys** (مفاتيح API)
3. انسخ **Secret Key** (المفتاح السري)
   - للتطوير: `test_sk_xxxxxxxxxxxxx`
   - للإنتاج: `live_sk_xxxxxxxxxxxxx`

⚠️ **مهم**: لا تشارك هذا المفتاح مع أحد!

---

## الخطوة 2️⃣: إعداد Webhook في Chargily

### لماذا Webhook؟

Webhook يسمح لـ Chargily بإخبار موقعك عندما ينجح الدفع، حتى يتم تفعيل الاشتراك تلقائياً.

### كيفية الإعداد:

1. في Chargily Dashboard، اذهب لـ **Settings** → **Webhooks**
2. اضغط **Add Webhook Endpoint**
3. املأ البيانات:

```
Endpoint URL: https://www.aifreelancer.app/api/payment/webhook
Description: AI Freelancer Payment Notifications
```

4. في **Events to Send**، اختر:
   - ✅ `checkout.paid` (دفع ناجح)
   - ✅ `checkout.failed` (دفع فاشل)
   - ✅ `checkout.expired` (انتهت المهلة)

5. اضغط **Create**

6. **انسخ Webhook Secret** (سيظهر مرة واحدة فقط!)
   - يبدأ بـ: `whsec_xxxxxxxxxxxxx`

---

## الخطوة 3️⃣: إضافة Environment Variables لـ Netlify

### 1. اذهب لـ Netlify Dashboard

- افتح: https://app.netlify.com
- اختر موقعك: **www.aifreelancer.app**

### 2. افتح Environment Variables

1. اذهب لـ **Site settings** (إعدادات الموقع)
2. من القائمة الجانبية، اختر **Environment variables**
3. اضغط **Add a variable**

### 3. أضف المتغيرات التالية:

#### Variable 1: Chargily Secret Key
```
Key: CHARGILY_SECRET_KEY
Value: test_sk_xxxxxxxxxxxxx   (المفتاح الذي نسخته من الخطوة 1)
```

#### Variable 2: Chargily Webhook Secret
```
Key: CHARGILY_WEBHOOK_SECRET
Value: whsec_xxxxxxxxxxxxx     (المفتاح الذي نسخته من الخطوة 2)
```

#### Variable 3: Supabase Service Key (للـ Webhook)
```
Key: SUPABASE_SERVICE_KEY
Value: (احصل عليه من Supabase Dashboard → Settings → API → service_role key)
```

⚠️ **انتبه**:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ≠ `SUPABASE_SERVICE_KEY`
- Service Key له صلاحيات كاملة (لا تشاركه!)

### 4. احفظ التغييرات

اضغط **Save** بعد كل متغير

---

## الخطوة 4️⃣: إعادة نشر الموقع

⚠️ **مهم جداً**: بعد إضافة Environment Variables، يجب إعادة النشر!

1. اذهب لتبويب **Deploys**
2. اضغط **Trigger deploy**
3. اختر **Clear cache and deploy site**
4. انتظر حتى ينتهي النشر (2-3 دقائق)

---

## الخطوة 5️⃣: اختبار الدفع

### 1. اذهب لصفحة الترقية

- افتح: https://www.aifreelancer.app/dashboard/upgrade
- سجل دخول إذا لم تكن مسجلاً

### 2. اختر خطة

- اختر **Monthly** (شهري) أو **Yearly** (سنوي)

### 3. اختر وسيلة الدفع

- اختر **Edahabia / CIB**
- ستلاحظ أن السعر تحول لـ **DZD فقط**

### 4. تحقق من Console

1. افتح **Browser Developer Tools** (F12)
2. اذهب لتبويب **Console**
3. يجب أن ترى:

```javascript
[Chargily] Environment check: {
  hasSecretKey: true,           ✅ يجب أن يكون true
  secretKeyPrefix: 'test_sk_...',  ✅ يجب أن يبدأ بـ test_ أو live_
  secretKeyLength: 45,          ✅ حوالي 40-50 حرف
  mode: 'test',
  appUrl: 'https://www.aifreelancer.app'
}
```

### 5. اضغط "Pay Now" (ادفع الآن)

- يجب أن يتم تحويلك لصفحة الدفع في Chargily
- أكمل الدفع (استخدم بطاقة تجريبية في وضع Test)

### 6. بعد الدفع الناجح

- سيتم تحويلك لـ: `/dashboard/upgrade/success`
- Webhook سيُرسل إشعار للموقع
- الاشتراك سيتفعل تلقائياً في Supabase

---

## 🔍 استكشاف الأخطاء

### خطأ: "Payment service not configured"

**السبب**: `CHARGILY_SECRET_KEY` غير موجود في Environment Variables

**الحل**:
1. تأكد من إضافة المتغير في Netlify
2. أعد نشر الموقع
3. انتظر 2-3 دقائق

---

### خطأ: 422 Unprocessable Entity

**الأسباب المحتملة**:

1. **Secret Key خاطئ أو غير صحيح**
   - تأكد أنه يبدأ بـ `test_sk_` أو `live_sk_`
   - تأكد أنك نسخته كاملاً بدون مسافات

2. **Mode غير متطابق**
   - إذا كنت تستخدم `test_sk_`، تأكد أنك في Test Mode
   - إذا كنت تستخدم `live_sk_`، تأكد أنك في Live Mode

3. **Amount خاطئ**
   - تأكد أن المبلغ رقم صحيح (1350، وليس 13.50)

**الحل**: تحقق من Console logs في المتصفح

---

### Webhook لا يعمل

**التحقق**:

1. في Chargily Dashboard → **Webhooks**
2. اضغط على webhook الذي أضفته
3. تحقق من **Recent Deliveries** (الطلبات الأخيرة)
4. إذا كان هناك أخطاء، ستراها هنا

**الأخطاء الشائعة**:

- ❌ URL خاطئ → تأكد: `https://www.aifreelancer.app/api/payment/webhook`
- ❌ SSL خطأ → تأكد أن موقعك يعمل بـ HTTPS
- ❌ Signature invalid → تأكد من `CHARGILY_WEBHOOK_SECRET` في Netlify

---

## 📱 للتواصل والدعم

إذا واجهت أي مشكلة:

1. تحقق من Console logs في المتصفح
2. تحقق من Function logs في Netlify
3. تواصل مع دعم Chargily: support@chargily.com

---

## 🚀 الانتقال للوضع الحقيقي (Production)

عندما تكون جاهزاً للإطلاق الفعلي:

### 1. احصل على Live API Keys

- في Chargily Dashboard، اذهب للوضع الحقيقي (Live Mode)
- انسخ **Live Secret Key** (يبدأ بـ `live_sk_`)

### 2. حدّث Environment Variables

- غيّر `CHARGILY_SECRET_KEY` من `test_sk_...` إلى `live_sk_...`

### 3. حدّث Webhook

- أضف webhook جديد في Live Mode
- استخدم نفس URL: `https://www.aifreelancer.app/api/payment/webhook`

### 4. أعد النشر

- أعد نشر الموقع لتطبيق التغييرات

⚠️ **تحذير**: في Live Mode، الدفعات حقيقية! تأكد من اختبار كل شيء في Test Mode أولاً.

---

## ✅ Checklist النهائي

قبل الإطلاق، تأكد من:

- [ ] ✅ `CHARGILY_SECRET_KEY` مضاف في Netlify
- [ ] ✅ `CHARGILY_WEBHOOK_SECRET` مضاف في Netlify
- [ ] ✅ `SUPABASE_SERVICE_KEY` مضاف في Netlify
- [ ] ✅ Webhook مُعدّ في Chargily Dashboard
- [ ] ✅ تم إعادة نشر الموقع بعد إضافة المتغيرات
- [ ] ✅ اختبرت الدفع في Test Mode
- [ ] ✅ Webhook يعمل ويُحدّث Supabase

---

**تم التحديث**: مارس 2026
**الإصدار**: 1.0
