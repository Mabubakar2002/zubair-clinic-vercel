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
3. Gmail (taimoorabdullahbrw2732@gmail.com) me "Activate Form" dabayein. Activation ke baad har booking seedha server se email hogi; website visitors ko login ki zaroorat nahi.
4. Agar pehli booking activation se pehle bheji gayi ho to activation ke baad dobara test karein.

STEP 4 - REVIEWS KHUD WEBSITE PAR DIKHANE KE LIYE (sirf ek baar)
1. Vercel me apna project kholein > "Storage" tab > "Create Database" > "Upstash for Redis" (free plan) > Create.
2. Project se connect karein (Connect Project), phir Deployments me "Redeploy" dabayein.
3. Ab client review likhega to woh khud website par aa jayega, aur aap ko email bhi aayegi.
   (Agar kisi ka bura review hatana ho to Upstash console me "reviews" list se delete karein.)

NOTE: Step 4 na karein to bhi booking email aur review email chalenge, bas reviews website par khud nahi dikhenge.
Email badalni ho to index.html me CLINIC_EMAIL dhoondh kar badal dein.
