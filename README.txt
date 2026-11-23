ZUBAIR VETERINARY CLINIC - WEBSITE (VERCEL)

Is folder me: index.html (website), api/reviews.js (reviews ke liye), package.json

STEP 1 - GITHUB PAR DALEIN (5 minute)
1. github.com par free account banayein.
2. "New repository" dabayein, naam likhein: zubair-clinic, phir "Create repository".
3. "uploading an existing file" par click karein, is folder ki SAB files (index.html, package.json aur api folder) kheench kar daalein.
   (api folder andar reviews.js ke saath hona chahiye.) Phir "Commit changes".

STEP 2 - VERCEL PAR DEPLOY
1. vercel.com par "Continue with GitHub" se login karein.
2. "Add New" > "Project" > apni zubair-clinic repository ke saamne "Import".
3. Kuch na badlein, "Deploy" dabayein. 1 minute me website ka link mil jayega.

STEP 3 - EMAIL CHALU KARNA (sirf ek baar)
1. Updated files GitHub par push karke Vercel deployment complete hone dein.
2. Live website par ek test booking bhejein. Pehli booking par FormSubmit activation email aa sakti hai (Spam bhi dekhein).
3. Gmail (uawan6040@gmail.com) me "Activate Form" dabayein. Activation ke baad har booking seedha server se email hogi; website visitors ko login ki zaroorat nahi.
4. Agar pehli booking activation se pehle bheji gayi ho to activation ke baad dobara test karein.

STEP 4 - REVIEWS WEBSITE PAR SAVE KARNA AUR MANAGE KARNA
1. Vercel me project kholein > "Storage" > "Create Database" > "Upstash for Redis" > Create, phir database ko project se connect karein.
2. Vercel project ke "Settings" > "Environment Variables" me REVIEW_ADMIN_PASSWORD naam ka variable banayein. Is me apna private, strong passcode (kam az kam 16 characters) set karein. Password website/code me na likhein aur kisi se share na karein.
3. Vercel Deployments me "Redeploy" karein. Ab client ka review Upstash me save hoga aur website par khud dikhai dega; reviews automatically delete/trim nahi honge.
4. Apni website ke Client Reviews section me "Manage reviews" dabayein, REVIEW_ADMIN_PASSWORD enter karein, phir jis review ko hatana ho us ka "Delete review" dabayein. Public visitors sirf review likh sakte hain; delete ke liye admin passcode chahiye.
5. Agar reviews pehle save huay thay, woh bhi maujood rahenge. Database connect na ho to review form error dikhayega; review ko saved hone ka ghalat confirmation nahi dega.
Email badalni ho to index.html me CLINIC_EMAIL dhoondh kar badal dein.
