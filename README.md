# Assignment 5 - Sequelize

الحل يستخدم المكتبات الموجودة فقط، ويغطي Part 1 وPart 2.

## الهيكل

```text
src/
├── main.js
├── config/
│   └── config.service.js
├── common/
│   └── globalErrorHandler.js
├── database/
│   ├── connection.js
│   └── models/
│       ├── user.model.js
│       ├── post.model.js
│       ├── comment.model.js
│       └── index.js
└── modules/
    ├── user/
    │   ├── user.controller.js
    │   ├── user.service.js
    │   └── index.js
    ├── post/
    │   ├── post.controller.js
    │   ├── post.service.js
    │   └── index.js
    └── comment/
        ├── comment.controller.js
        ├── comment.service.js
        └── index.js
```

الـcontroller يستقبل الطلب ويرسل الاستجابة، والـservice ينفذ العمليات، وindex يصدّر الـcontroller. التحقق ومعالجة الأخطاء موجودان في ملف common المحدد دون ملف مساعد إضافي.

## التشغيل

1. شغّل MySQL في XAMPP. شغّل Apache أيضًا للوصول إلى phpMyAdmin.
2. في phpMyAdmin نفّذ:

```sql
CREATE DATABASE IF NOT EXISTS assignment5;
```

3. افتح التيرمنال داخل مجلد المشروع الذي يحتوي package.json. داخل مساحة العمل الحالية هذا المجلد هو Part1. النسخة الأخرى موجودة في D:\الصيفي\assignment5.
4. تأكد من development.env:

```ini
PORT=3000
DB_NAME=assignment5
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_DIALECT=mysql
DB_MAX=10
DB_MIN=1
```

إذا كان MySQL يستخدم منفذًا مختلفًا يمكن إضافة DB_PORT. إذا كانت لديك كلمة مرور ضعها في DB_PASS. لا ترفع development.env إلى Git.

5. إذا لم تكن node_modules موجودة نفّذ npm.cmd install، ثم:

```powershell
npm.cmd run start:dev
```

يظهر DB connected ثم عنوان السيرفر. استخدم Ctrl+C لإيقافه. إذا ظهر EADDRINUSE أوقف السيرفر القديم، أو غيّر PORT وbaseUrl في Postman إلى المنفذ نفسه.

يستخدم التشغيل sequelize.sync() دون alter ودون force. ينشئ الجداول الناقصة ولا يحدّث تعريف الجداول الموجودة. عند تغيير model لجداول تحتوي بيانات استخدم migration مناسبة؛ لا يلزم حذف أي جدول لتجربة الحل الحالي. إذا أردت البدء من جديد على قاعدة تجريبية فارغة، يمكنك إنشاء قاعدة جديدة وتغيير DB_NAME.

## سلوك PUT المطلوب

PUT /users/:id يبحث أولًا عبر findByPk. للموجود يستخدم set ثم save({ validate: false })، ولغير الموجود يستخدم create({ validate: false }). لا يوجد upsert. كلمة المرور القديمة تبقى كما هي إذا لم ترسلها عند التعديل. الإنشاء يحتاج name وemail وpassword، وعدم إرسال أحدها يعطي 400.

validate:false يتخطى validators، لكنه لا يعطل beforeCreate. لذلك اسم المستخدم الجديد يجب أن يزيد على حرفين، بينما يمكن اختبار تخطي تحقق البريد وكلمة المرور بإرسال بريد غير صالح وكلمة مرور قصيرة. قيد البريد الفريد وقيود قاعدة البيانات تبقى سارية.

## Postman

ملف Assignment5.postman_collection.json موجود في جذر المشروع. اضغط Import واختره، ثم افتح Variables وتأكد أن baseUrl يطابق عنوان السيرفر. شغّل جميع المجلدات بالترتيب عبر Run collection مع Iterations = 1.

الملف يحتوي 45 طلبًا و72 فحصًا. أول طلب يولد بريدًا جديدًا لكل تشغيل، وتحفظ المعرّفات تلقائيًا. بعض الطلبات تختبر حالات رفض وتنجح عندما يكون HTTP status مطابقًا للمتوقع. كل تشغيل يضيف بيانات تجريبية جديدة.

للتجربة اليدوية أضف متغيرات Collection: baseUrl=http://localhost:3000، وownerId وotherId وpostId وcommentId. املأ المعرّفات من استجابات الإنشاء؛ لا تفترض أنها تبدأ من 1. كل GET بدون Body. في POST وPUT وPATCH وDELETE اختر Body > raw > JSON، مع Content-Type: application/json. المتغيرات الرقمية في JSON تكتب دون تنصيص بعد ضبط قيمها. لا تحتاج إلى Token؛ userId في body هو المستخدم الذي تطبّق عليه مقارنة الملكية حسب الواجب.

## جميع الـendpoints بالترتيب المناسب للاختبار

### 1. إضافة مستخدم

POST {{baseUrl}}/users/signup

```json
{
  "name": "Ahmed",
  "email": "user1@gmail.com",
  "password": "1234567",
  "role": "user"
}
```

المتوقع 201 مع message وuser. ضع user.id في ownerId. أنشئ مستخدمًا ثانيًا باسم Omar وبريد user2@gmail.com وضع معرّفه في otherId. إذا كانت هذه العناوين موجودة بالفعل استخدم عناوين جديدة.

تكرار البريد يعطي 409. بريد غير صالح أو كلمة مرور بطول 6 أو أقل أو اسم بطول 2 أو أقل يعطي 400. استخدم بريدًا جديدًا عند اختبار كلمة المرور والاسم.

### 2. البحث بالبريد

GET {{baseUrl}}/users/by-email?email=user1@gmail.com

بدون Body. المتوقّع 200 مع user، والبريد غير الموجود يعطي 404. عدم إرسال email يعطي 400.

### 3. جلب مستخدم بالمعرّف

GET {{baseUrl}}/user/{{ownerId}}

بدون Body. المتوقّع 200 دون role ودون password. يعمل أيضًا /users/{{ownerId}}. المعرّف غير الموجود يعطي 404.

### 4. تعديل مستخدم أو إنشاؤه

PUT {{baseUrl}}/users/{{otherId}}

```json
{
  "name": "Updated Omar",
  "email": "user2@gmail.com",
  "role": "user"
}
```

المتوقّع 200 مع User created or updated successfully. كلمة المرور القديمة تبقى كما هي. جرّب إرسال password بقيمة "1" لتأكيد تخطي validator.

للإنشاء استخدم معرّفًا غير موجود لديك، مثل /users/1000 إذا لم يكن موجودًا:

```json
{
  "name": "New User",
  "email": "newuser@gmail.com",
  "password": "1234567",
  "role": "user"
}
```

المتوقّع 200 ويمكن قراءته عبر GET /user/1000. حذف password من Body عند إنشاء معرّف غير موجود يعطي 400. age ليس حقلًا في الموديل ويُتجاهل. تغيير البريد يعني أنك ستبحث لاحقًا بالبريد الجديد.

### 5. إضافة منشور

POST {{baseUrl}}/posts

```json
{
  "title": "First Post",
  "content": "Hello world",
  "userId": {{ownerId}}
}
```

المتوقّع 201. ضع post.id في postId. مستخدم غير موجود يعطي 404. يمكنك إضافة منشور ثانٍ دون تعليقات لاختبار commentCount=0.

### 6. إضافة تعليقات بالجملة

POST {{baseUrl}}/comments

```json
{
  "comments": [
    { "content": "the first comment", "postId": {{postId}}, "userId": {{ownerId}} },
    { "content": "the second comment", "postId": {{postId}}, "userId": {{otherId}} },
    { "content": "third comment", "postId": {{postId}}, "userId": {{ownerId}} },
    { "content": "fourth comment", "postId": {{postId}}, "userId": {{otherId}} }
  ]
}
```

المتوقّع 201 مع message وcomments. ضع comments[0].id في commentId. المصفوفة الفارغة تعطي 400. مرجع غير موجود يعطي 404 ولا يُضاف جزء من المجموعة.

### 7. المنشورات مع المستخدم والتعليقات

GET {{baseUrl}}/posts/details

بدون Body. المتوقّع 200 ومصفوفة. حقول المنشور id,title، والمستخدم id,name، والتعليقات id,content فقط.

### 8. عدّ التعليقات لكل منشور

GET {{baseUrl}}/posts/comment-count

بدون Body. المتوقّع 200. بعد إضافة التعليقات السابقة مرة واحدة يكون commentCount للمنشور 4، ولمنشور بلا تعليقات 0.

### 9. تعديل تعليق

PATCH {{baseUrl}}/comments/{{commentId}}

```json
{
  "userId": {{ownerId}},
  "content": "the updated comment"
}
```

المتوقّع 200 مع Comment updated. جرّب otherId بدل ownerId؛ المتوقّع 403 دون تعديل المحتوى. تعليق غير موجود يعطي 404. المحتوى الفارغ يعطي 400.

### 10. إيجاد تعليق أو إنشاؤه

POST {{baseUrl}}/comments/find-or-create

```json
{
  "postId": {{postId}},
  "userId": {{otherId}},
  "content": "This is a sample comment"
}
```

أول طلب للقيم الجديدة يعطي 201 وcreated:true. تكراره بالقيم نفسها يعطي 200 وcreated:false ونفس comment.id. عدد التعليقات يصبح 5 بعد إنشاء هذا التعليق مرة واحدة.

### 11. البحث في التعليقات

GET {{baseUrl}}/comments/search?word=the

بدون Body. المتوقّع 200 مع count وcomments. مثال التعليقات السابق يعطي نتيجتين إذا لم توجد تعليقات مطابقة أخرى في قاعدة البيانات. كلمة لا تطابق أي تعليق تعطي 200 مع count:0 وcomments:[] ورسالة no comments found. عدم إرسال word يعطي 400.

### 12. أحدث ثلاثة تعليقات لمنشور

GET {{baseUrl}}/comments/newest/{{postId}}

بدون Body. المتوقّع 200 ومصفوفة من ثلاثة تعليقات كحد أقصى، الأحدث أولًا. الحقول id,content,createdAt. المنشور الموجود بلا تعليقات يعيد []، والمنشور غير الموجود يعطي 404.

### 13. تفاصيل تعليق

GET {{baseUrl}}/comments/details/{{commentId}}

بدون Body. المتوقّع 200 مع id,content وuser بحقوله id,name,email وpost بحقوله id,title,content. تعليق غير موجود يعطي 404.

### 14. حذف المنشور — نفّذه آخرًا

DELETE {{baseUrl}}/posts/{{postId}}

جرّب مستخدمًا آخر أولًا:

```json
{
  "userId": {{otherId}}
}
```

المتوقّع 403. ثم أرسل المالك:

```json
{
  "userId": {{ownerId}}
}
```

المتوقّع 200 مع Post deleted. كرّر الطلب فتكون النتيجة 404. أعد /posts/details و/posts/comment-count ولن يظهر المنشور. للتأكد من الحذف الناعم نفّذ في phpMyAdmin:

```sql
SELECT id, title, deletedAt FROM posts ORDER BY id DESC;
```

يبقى الصف ويمتلئ deletedAt. التعليقات تبقى، وتفاصيل التعليق تعيد post:null لأن المنشور محذوف. إضافة تعليق جديد إلى المنشور المحذوف تعطي 404.

## التحقق والتسليم

اختُبرت النسخة المعدلة عبر HTTP وMySQL على قاعدة منفصلة: نجحت طلبات الـCollection الـ45 وفحوصاتها الـ72 في تشغيلين متتاليين، مع فحوصات إضافية لحفظ كلمة المرور، والحذف الناعم، والعلاقات، وإعادة التشغيل دون زيادة indexes. حُذفت قاعدة الاختبار بعد الانتهاء، ولا توجد ملفات اختبار إضافية في المشروع.

سمِّ الطلبات بأسماء واضحة، واضغط Ctrl+S بعد تعديل كل طلب. صدّر الـCollection من قائمة Export وأرفقها أو رابطها مع المشروع وفق طريقة التسليم.
