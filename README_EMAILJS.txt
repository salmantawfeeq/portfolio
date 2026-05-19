لاستخدام EmailJS بدون باك-أند

1) افتح موقع EmailJS وسجل Create service
   - تحصل على: SERVICE_ID
   - تحصل على: TEMPLATE_ID (مع variables مثل: name, email, message)
   - تحصل على USER_ID (Public Key)

2) أضف سكربت EmailJS في index.html قبل script.js:
   <script type="text/javascript" src="https://cdn.emailjs.com/dist/email.min.js"></script>

3) في script.js استبدل mailtoUrl block باستدعاء:
   emailjs.init(USER_ID);
   emailjs.send(SERVICE_ID, TEMPLATE_ID, { name, email, message })

4) لازم تكون الفورم Variables مطابقة لأسماء التوكنات في EmailJS Template.

