-- Seed Data for AlumNode (Indian Context)
-- Run this AFTER schema.sql in your Supabase SQL editor

-- Insert sample users (passwords are hashed for 'password123')
INSERT INTO users (id, email, password, name, bio, phone, graduation_year, degree, major, current_title, current_company, location, social_links, skills, interests, is_verified, is_active) VALUES
-- User 1: Priya Sharma
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'priya.sharma@gmail.com', '$2a$10$rZ8qNX5Z5Z5Z5Z5Z5Z5Z5uK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Priya Sharma', 'Software Engineer passionate about AI/ML. IIT Delhi alumna. Love mentoring juniors and building scalable systems.', '+91-9876543210', 2018, 'B.Tech', 'Computer Science', 'Senior Software Engineer', 'Flipkart', 
'{"city": "Bangalore", "state": "Karnataka", "country": "India"}',
'{"linkedin": "https://linkedin.com/in/priyasharma", "github": "https://github.com/priyasharma", "twitter": "https://twitter.com/priyatech"}',
ARRAY['Python', 'React', 'Node.js', 'AWS', 'Machine Learning', 'Docker'],
ARRAY['AI/ML', 'Open Source', 'Mentoring', 'Cricket', 'Travel'],
true, true),

-- User 2: Rahul Verma
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'rahul.verma@gmail.com', '$2a$10$rZ8qNX5Z5Z5Z5Z5Z5Z5Z5uK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Rahul Verma', 'Product Manager at Paytm. Building fintech solutions for Bharat. Ex-Zomato, Ex-Ola.', '+91-9876543211', 2016, 'B.Tech', 'Electronics', 'Senior Product Manager', 'Paytm',
'{"city": "Noida", "state": "Uttar Pradesh", "country": "India"}',
'{"linkedin": "https://linkedin.com/in/rahulverma", "twitter": "https://twitter.com/rahulpm"}',
ARRAY['Product Management', 'Agile', 'SQL', 'Analytics', 'UX Design'],
ARRAY['Fintech', 'Startups', 'Photography', 'Trekking'],
true, true),

-- User 3: Ananya Iyer
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'ananya.iyer@gmail.com', '$2a$10$rZ8qNX5Z5Z5Z5Z5Z5Z5Z5uK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Ananya Iyer', 'Data Scientist at Google. Working on NLP and recommendation systems. Love solving complex problems.', '+91-9876543212', 2019, 'M.Tech', 'Data Science', 'Data Scientist', 'Google India',
'{"city": "Hyderabad", "state": "Telangana", "country": "India"}',
'{"linkedin": "https://linkedin.com/in/ananyaiyer", "github": "https://github.com/ananyaiyer"}',
ARRAY['Python', 'TensorFlow', 'NLP', 'SQL', 'Tableau', 'R'],
ARRAY['Data Science', 'Reading', 'Classical Music', 'Yoga'],
true, true),

-- User 4: Arjun Patel
('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'arjun.patel@gmail.com', '$2a$10$rZ8qNX5Z5Z5Z5Z5Z5Z5Z5uK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Arjun Patel', 'Full Stack Developer | Open Source Contributor | Tech Blogger. Building cool stuff with MERN stack.', '+91-9876543213', 2020, 'B.Tech', 'Information Technology', 'Software Developer', 'Infosys',
'{"city": "Pune", "state": "Maharashtra", "country": "India"}',
'{"linkedin": "https://linkedin.com/in/arjunpatel", "github": "https://github.com/arjunpatel", "website": "https://arjunpatel.dev"}',
ARRAY['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express', 'TypeScript'],
ARRAY['Web Development', 'Blogging', 'Gaming', 'Football'],
true, true),

-- User 5: Sneha Reddy
('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'sneha.reddy@gmail.com', '$2a$10$rZ8qNX5Z5Z5Z5Z5Z5Z5Z5uK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Sneha Reddy', 'UX Designer at Swiggy. Crafting delightful user experiences. Design thinking enthusiast.', '+91-9876543214', 2017, 'B.Des', 'Interaction Design', 'Senior UX Designer', 'Swiggy',
'{"city": "Bangalore", "state": "Karnataka", "country": "India"}',
'{"linkedin": "https://linkedin.com/in/snehareddy", "behance": "https://behance.net/snehareddy", "dribbble": "https://dribbble.com/snehareddy"}',
ARRAY['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'Design Systems'],
ARRAY['Design', 'Art', 'Cooking', 'Travel'],
true, true),

-- User 6: Vikram Singh
('f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', 'vikram.singh@gmail.com', '$2a$10$rZ8qNX5Z5Z5Z5Z5Z5Z5Z5uK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Vikram Singh', 'DevOps Engineer at Amazon. Cloud infrastructure and automation expert. AWS certified.', '+91-9876543215', 2015, 'B.Tech', 'Computer Science', 'DevOps Engineer', 'Amazon',
'{"city": "Chennai", "state": "Tamil Nadu", "country": "India"}',
'{"linkedin": "https://linkedin.com/in/vikramsingh", "github": "https://github.com/vikramsingh"}',
ARRAY['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'Python'],
ARRAY['Cloud Computing', 'Automation', 'Cricket', 'Movies'],
true, true),

-- User 7: Kavya Nair
('a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d', 'kavya.nair@gmail.com', '$2a$10$rZ8qNX5Z5Z5Z5Z5Z5Z5Z5uK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Kavya Nair', 'Cybersecurity Analyst at TCS. Ethical hacker. Passionate about securing digital India.', '+91-9876543216', 2019, 'M.Tech', 'Cybersecurity', 'Security Analyst', 'TCS',
'{"city": "Mumbai", "state": "Maharashtra", "country": "India"}',
'{"linkedin": "https://linkedin.com/in/kavyanair", "twitter": "https://twitter.com/kavyasec"}',
ARRAY['Penetration Testing', 'Network Security', 'Python', 'Linux', 'SIEM'],
ARRAY['Cybersecurity', 'CTF Challenges', 'Reading', 'Badminton'],
true, true),

-- User 8: Aditya Gupta
('b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e', 'aditya.gupta@gmail.com', '$2a$10$rZ8qNX5Z5Z5Z5Z5Z5Z5Z5uK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Aditya Gupta', 'Blockchain Developer | Web3 Enthusiast. Building decentralized applications for the future.', '+91-9876543217', 2021, 'B.Tech', 'Computer Science', 'Blockchain Developer', 'Polygon',
'{"city": "Bangalore", "state": "Karnataka", "country": "India"}',
'{"linkedin": "https://linkedin.com/in/adityagupta", "github": "https://github.com/adityagupta", "twitter": "https://twitter.com/adityaweb3"}',
ARRAY['Solidity', 'Ethereum', 'Web3.js', 'Smart Contracts', 'JavaScript', 'React'],
ARRAY['Blockchain', 'Crypto', 'Gaming', 'Tech Meetups'],
true, true),

-- User 9: Meera Krishnan
('c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 'meera.krishnan@gmail.com', '$2a$10$rZ8qNX5Z5Z5Z5Z5Z5Z5Z5uK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Meera Krishnan', 'Mobile App Developer at PhonePe. Flutter expert. Building apps used by millions of Indians.', '+91-9876543218', 2018, 'B.Tech', 'Computer Science', 'Senior Mobile Developer', 'PhonePe',
'{"city": "Bangalore", "state": "Karnataka", "country": "India"}',
'{"linkedin": "https://linkedin.com/in/meerakrishnan", "github": "https://github.com/meerakrishnan"}',
ARRAY['Flutter', 'Dart', 'Firebase', 'iOS', 'Android', 'React Native'],
ARRAY['Mobile Development', 'Dance', 'Travel', 'Food'],
true, true),

-- User 10: Rohan Malhotra
('d0e1f2a3-b4c5-4d5e-7f8a-9b0c1d2e3f4a', 'rohan.malhotra@gmail.com', '$2a$10$rZ8qNX5Z5Z5Z5Z5Z5Z5Z5uK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Rohan Malhotra', 'Startup Founder | Ex-McKinsey. Building EdTech solutions for rural India. Angel investor.', '+91-9876543219', 2014, 'MBA', 'Business Administration', 'Founder & CEO', 'LearnHub India',
'{"city": "Gurgaon", "state": "Haryana", "country": "India"}',
'{"linkedin": "https://linkedin.com/in/rohanmalhotra", "twitter": "https://twitter.com/rohanmalhotra"}',
ARRAY['Business Strategy', 'Product Management', 'Fundraising', 'Leadership'],
ARRAY['Entrepreneurship', 'Education', 'Investing', 'Golf'],
true, true);

-- Insert Events
INSERT INTO events (id, title, description, event_type, start_date, end_date, location, is_virtual, virtual_link, max_attendees, is_public, created_by) VALUES
('e1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c', 'Tech Talk: AI in Healthcare', 'Join us for an insightful discussion on how AI is transforming healthcare in India. Industry experts will share their experiences.', 'Workshop', '2025-11-15 18:00:00+05:30', '2025-11-15 20:00:00+05:30',
'{"venue": "IIT Delhi Auditorium", "city": "New Delhi", "state": "Delhi", "country": "India"}',
false, null, 200, true, 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'),

('e2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d', 'Alumni Meetup Bangalore 2025', 'Annual alumni gathering in Bangalore. Network with fellow alumni, share experiences, and enjoy good food!', 'Networking', '2025-12-01 17:00:00+05:30', '2025-12-01 21:00:00+05:30',
'{"venue": "Taj West End", "city": "Bangalore", "state": "Karnataka", "country": "India"}',
false, null, 150, true, 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e'),

('e3c4d5e6-f7a8-4b9c-0d1e-2f3a4b5c6d7e', 'Career Guidance Webinar', 'Free webinar for final year students. Learn about career paths in tech, interview tips, and resume building.', 'Webinar', '2025-11-20 19:00:00+05:30', '2025-11-20 21:00:00+05:30',
'{"virtual": true}',
true, 'https://meet.google.com/abc-defg-hij', 500, true, 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f'),

('e4d5e6f7-a8b9-4c0d-1e2f-3a4b5c6d7e8f', 'Diwali Celebration 2025', 'Celebrate Diwali with the alumni community! Cultural performances, games, and traditional dinner.', 'Social', '2025-11-10 18:00:00+05:30', '2025-11-10 22:00:00+05:30',
'{"venue": "Leela Palace", "city": "Mumbai", "state": "Maharashtra", "country": "India"}',
false, null, 100, true, 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b'),

('e5e6f7a8-b9c0-4d1e-2f3a-4b5c6d7e8f9a', 'Startup Pitch Day', 'Alumni startups pitch their ideas to investors. Great networking opportunity for entrepreneurs and investors.', 'Conference', '2025-12-15 10:00:00+05:30', '2025-12-15 17:00:00+05:30',
'{"venue": "91Springboard", "city": "Pune", "state": "Maharashtra", "country": "India"}',
false, null, 80, true, 'd0e1f2a3-b4c5-4d5e-7f8a-9b0c1d2e3f4a');

-- Insert Jobs
INSERT INTO jobs (id, title, description, company, location, job_type, experience_level, salary_range, skills_required, application_deadline, is_active, posted_by) VALUES
('j1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c', 'Senior Full Stack Developer', 'We are looking for an experienced Full Stack Developer to join our team in Bangalore. Work on cutting-edge fintech products.', 'Razorpay',
'{"city": "Bangalore", "state": "Karnataka", "country": "India"}',
'Full-time', 'Senior', '{"min": 2000000, "max": 3500000, "currency": "INR"}',
ARRAY['React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
'2025-12-31 23:59:59+05:30', true, 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e'),

('j2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d', 'Data Scientist - NLP', 'Join our AI team to work on Natural Language Processing projects. Experience with Indian languages is a plus.', 'Flipkart',
'{"city": "Bangalore", "state": "Karnataka", "country": "India"}',
'Full-time', 'Mid-level', '{"min": 1800000, "max": 2800000, "currency": "INR"}',
ARRAY['Python', 'NLP', 'TensorFlow', 'PyTorch', 'Machine Learning'],
'2025-11-30 23:59:59+05:30', true, 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'),

('j3c4d5e6-f7a8-4b9c-0d1e-2f3a4b5c6d7e', 'Product Manager - Payments', 'Lead product development for our payments platform. 3+ years of PM experience required.', 'Paytm',
'{"city": "Noida", "state": "Uttar Pradesh", "country": "India"}',
'Full-time', 'Senior', '{"min": 2500000, "max": 4000000, "currency": "INR"}',
ARRAY['Product Management', 'Agile', 'Analytics', 'SQL'],
'2025-12-15 23:59:59+05:30', true, 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e'),

('j4d5e6f7-a8b9-4c0d-1e2f-3a4b5c6d7e8f', 'UX Designer', 'Design delightful experiences for millions of users. Portfolio required.', 'Swiggy',
'{"city": "Bangalore", "state": "Karnataka", "country": "India"}',
'Full-time', 'Mid-level', '{"min": 1500000, "max": 2500000, "currency": "INR"}',
ARRAY['Figma', 'User Research', 'Prototyping', 'Design Systems'],
'2025-11-25 23:59:59+05:30', true, 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b'),

('j5e6f7a8-b9c0-4d1e-2f3a-4b5c6d7e8f9a', 'DevOps Engineer', 'Manage cloud infrastructure and CI/CD pipelines. AWS certification preferred.', 'Amazon',
'{"city": "Hyderabad", "state": "Telangana", "country": "India"}',
'Full-time', 'Senior', '{"min": 2200000, "max": 3500000, "currency": "INR"}',
ARRAY['AWS', 'Kubernetes', 'Docker', 'Jenkins', 'Terraform'],
'2025-12-20 23:59:59+05:30', true, 'f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c'),

('j6f7a8b9-c0d1-4e2f-3a4b-5c6d7e8f9a0b', 'Blockchain Developer', 'Build Web3 applications on Ethereum and Polygon. Smart contract experience required.', 'Polygon',
'{"city": "Bangalore", "state": "Karnataka", "country": "India"}',
'Full-time', 'Mid-level', '{"min": 1800000, "max": 3000000, "currency": "INR"}',
ARRAY['Solidity', 'Ethereum', 'Web3.js', 'Smart Contracts', 'JavaScript'],
'2025-12-10 23:59:59+05:30', true, 'b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e');

-- Insert Event Attendees
INSERT INTO event_attendees (event_id, user_id, status) VALUES
('e1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'registered'),
('e1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'registered'),
('e1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'registered'),
('e2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'registered'),
('e2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d', 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'registered'),
('e2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d', 'c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 'registered'),
('e3c4d5e6-f7a8-4b9c-0d1e-2f3a4b5c6d7e', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'registered'),
('e3c4d5e6-f7a8-4b9c-0d1e-2f3a4b5c6d7e', 'b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e', 'registered'),
('e4d5e6f7-a8b9-4c0d-1e2f-3a4b5c6d7e8f', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'registered'),
('e4d5e6f7-a8b9-4c0d-1e2f-3a4b5c6d7e8f', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'registered'),
('e5e6f7a8-b9c0-4d1e-2f3a-4b5c6d7e8f9a', 'd0e1f2a3-b4c5-4d5e-7f8a-9b0c1d2e3f4a', 'registered'),
('e5e6f7a8-b9c0-4d1e-2f3a-4b5c6d7e8f9a', 'b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e', 'registered');

-- Insert Activity Logs
INSERT INTO activity_logs (user_id, action, details) VALUES
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'profile_updated', '{"field": "bio", "timestamp": "2025-10-20T10:30:00Z"}'),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'job_posted', '{"job_id": "j1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c", "timestamp": "2025-10-21T14:20:00Z"}'),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'event_registered', '{"event_id": "e1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c", "timestamp": "2025-10-22T09:15:00Z"}'),
('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'profile_viewed', '{"viewed_user": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d", "timestamp": "2025-10-22T11:00:00Z"}'),
('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'event_created', '{"event_id": "e4d5e6f7-a8b9-4c0d-1e2f-3a4b5c6d7e8f", "timestamp": "2025-10-19T16:45:00Z"}');

-- Insert Notifications
INSERT INTO notifications (user_id, title, message, type, is_read, related_id) VALUES
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'New Event: Tech Talk', 'A new event "Tech Talk: AI in Healthcare" has been posted. Register now!', 'event', false, 'e1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c'),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Job Application Received', 'Your job posting received 5 new applications.', 'job', false, 'j1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c'),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'Event Reminder', 'Tech Talk: AI in Healthcare starts in 2 days!', 'event', false, 'e1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c'),
('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'Profile View', 'Priya Sharma viewed your profile.', 'profile', true, 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'),
('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'New Job Posted', 'A new UX Designer position has been posted at Swiggy.', 'job', false, 'j4d5e6f7-a8b9-4c0d-1e2f-3a4b5c6d7e8f'),
('f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', 'Event Registration Confirmed', 'You are registered for Alumni Meetup Bangalore 2025.', 'event', false, 'e2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d'),
('a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d', 'Welcome to AlumNode!', 'Complete your profile to connect with fellow alumni.', 'system', false, null),
('b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e', 'New Connection Request', 'Rohan Malhotra wants to connect with you.', 'connection', false, 'd0e1f2a3-b4c5-4d5e-7f8a-9b0c1d2e3f4a');

-- Success message
SELECT 'Seed data inserted successfully! 🎉' as status,
       (SELECT COUNT(*) FROM users) as total_users,
       (SELECT COUNT(*) FROM events) as total_events,
       (SELECT COUNT(*) FROM jobs) as total_jobs,
       (SELECT COUNT(*) FROM notifications) as total_notifications;
