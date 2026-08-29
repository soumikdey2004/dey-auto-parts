const mysql = require('mysql'); // অথবা 'mysql2' যদি আপনি সেটি ব্যবহার করেন
const fs = require('fs');

// ক্লাউড ডেটাবেসের কানেকশন
const db = mysql.createConnection({
    host: 'bsfk9p7hei6qlzesnwv2-mysql.services.clever-cloud.com',
    user: 'uxlnro8g4ql6rvs9',
    password: 'qLEjAMVDT199lXNkihg6', // ⚠️ এখানে আপনার Clever Cloud-এর পাসওয়ার্ডটি বসান
    database: 'bsfk9p7hei6qlzesnwv2',
    port: 3306,
    multipleStatements: true // একসাথে অনেকগুলো SQL কমান্ড চালানোর পারমিশন
});

db.connect(err => {
    if (err) {
        console.error('Connection failed:', err);
        return;
    }
    console.log('Connected! Creating tables on Cloud...');

    // আপনার SQL ফাইলটি পড়া হচ্ছে (প্রথম দুটি লাইন বাদ দিয়ে)
    let sqlCode = fs.readFileSync('database.sql', 'utf8');
    sqlCode = sqlCode.replace('CREATE DATABASE IF NOT EXISTS dey_auto_parts;', '');
    sqlCode = sqlCode.replace('USE dey_auto_parts;', '');

    // ক্লাউডে টেবিল তৈরি করা হচ্ছে
    db.query(sqlCode, (err, results) => {
        if (err) {
            console.error('Error creating tables:', err);
        } else {
            console.log('🎉 Magic Successful! All tables and dummy data are now live on Cloud!');
        }
        process.exit();
    });
});