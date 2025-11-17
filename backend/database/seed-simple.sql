-- Simplified Seed Data for AlumNode (Auto-generated IDs)
-- Run this AFTER schema.sql in your Supabase SQL editor
-- Supabase will auto-generate all UUIDs!

-- Insert sample users (NO ID needed - auto-generated!)
-- Password for all users: 'password123'
INSERT INTO users (email, password, name, bio, phone, graduation_year, degree, major, current_title, current_company, location, social_links, skills, interests, is_verified, is_active) VALUES
('priya.sharma@gmail.com', '$2a$10$rZ8qNX5Z5Z5Z5Z5Z5Z5Z5uK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Priya Sharma', 'Software Engineer passionate about AI/ML. IIT Delhi alumna. Love mentoring juniors and building scalable systems.', '+91-9876543210', 2018, 'B.Tech', 'Computer Science', 'Senior Software Engineer', 'Flipkart', 
'{"city": "Bangalore", "state": "Karnataka", "country": "India"}',
'{"linkedin": "https://linkedin.com/in/priyasharma", "github": "https://github.com/priyasharma", "twitter": "https://twitter.com/priyatech"}',
ARRAY['Python', 'React', 'Node.js', 'AWS', 'Machine Learning', 'Docker'],
ARRAY['AI/ML', 'Open Source', 'Mentoring', 'Cricket', 'Travel'],
true, true),

('rahul.verma@gmail.com', '$2a$10$rZ8qNX5Z5Z5Z5Z5Z5Z5Z5uK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Rahul Verma', 'Product Manager at Paytm. Building fintech solutions for Bharat. Ex-Zomato, Ex-Ola.', '+91-9876543211', 2016, 'B.Tech', 'Electronics', 'Senior Product Manager', 'Paytm',
'{"city": "Noida", "state": "Uttar Pradesh", "country": "India"}',
'{"linkedin": "https://linkedin.com/in/rahulverma", "twitter": "https://twitter.com/rahulpm"}',
ARRAY['Product Management', 'Agile', 'SQL', 'Analytics', 'UX Design'],
ARRAY['Fintech', 'Startups', 'Photography', 'Trekking'],
true, true),

('ananya.iyer@gmail.com', '$2a$10$rZ8qNX5Z5Z5Z5Z5Z5Z5Z5uK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Ananya Iyer', 'Data Scientist at Google. Working on NLP and recommendation systems. Love solving complex problems.', '+91-9876543212', 2019, 'M.Tech', 'Data Science', 'Data Scientist', 'Google India',
'{"city": "Hyderabad", "state": "Telangana", "country": "India"}',
'{"linkedin": "https://linkedin.com/in/ananyaiyer", "github": "https://github.com/ananyaiyer"}',
ARRAY['Python', 'TensorFlow', 'NLP', 'SQL', 'Tableau', 'R'],
ARRAY['Data Science', 'Reading', 'Classical Music', 'Yoga'],
true, true),

('arjun.patel@gmail.com', '$2a$10$rZ8qNX5Z5Z5Z5Z5Z5Z5Z5uK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Arjun Patel', 'Full Stack Developer | Open Source Contributor | Tech Blogger. Building cool stuff with MERN stack.', '+91-9876543213', 2020, 'B.Tech', 'Information Technology', 'Software Developer', 'Infosys',
'{"city": "Pune", "state": "Maharashtra", "country": "India"}',
'{"linkedin": "https://linkedin.com/in/arjunpatel", "github": "https://github.com/arjunpatel", "website": "https://arjunpatel.dev"}',
ARRAY['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express', 'TypeScript'],
ARRAY['Web Development', 'Blogging', 'Gaming', 'Football'],
true, true),

('sneha.reddy@gmail.com', '$2a$10$rZ8qNX5Z5Z5Z5Z5Z5Z5Z5uK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Sneha Reddy', 'UX Designer at Swiggy. Crafting delightful user experiences. Design thinking enthusiast.', '+91-9876543214', 2017, 'B.Des', 'Interaction Design', 'Senior UX Designer', 'Swiggy',
'{"city": "Bangalore", "state": "Karnataka", "country": "India"}',
'{"linkedin": "https://linkedin.com/in/snehareddy", "behance": "https://behance.net/snehareddy", "dribbble": "https://dribbble.com/snehareddy"}',
ARRAY['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'Design Systems'],
ARRAY['Design', 'Art', 'Cooking', 'Travel'],
true, true),

('vikram.singh@gmail.com', '$2a$10$rZ8qNX5Z5Z5Z5Z5Z5Z5Z5uK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Vikram Singh', 'DevOps Engineer at Amazon. Cloud infrastructure and automation expert. AWS certified.', '+91-9876543215', 2015, 'B.Tech', 'Computer Science', 'DevOps Engineer', 'Amazon',
'{"city": "Chennai", "state": "Tamil Nadu", "country": "India"}',
'{"linkedin": "https://linkedin.com/in/vikramsingh", "github": "https://github.com/vikramsingh"}',
ARRAY['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'Python'],
ARRAY['Cloud Computing', 'Automation', 'Cricket', 'Movies'],
true, true),

('kavya.nair@gmail.com', '$2a$10$rZ8qNX5Z5Z5Z5Z5Z5Z5Z5uK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Kavya Nair', 'Cybersecurity Analyst at TCS. Ethical hacker. Passionate about securing digital India.', '+91-9876543216', 2019, 'M.Tech', 'Cybersecurity', 'Security Analyst', 'TCS',
'{"city": "Mumbai", "state": "Maharashtra", "country": "India"}',
'{"linkedin": "https://linkedin.com/in/kavyanair", "twitter": "https://twitter.com/kavyasec"}',
ARRAY['Penetration Testing', 'Network Security', 'Python', 'Linux', 'SIEM'],
ARRAY['Cybersecurity', 'CTF Challenges', 'Reading', 'Badminton'],
true, true),

('aditya.gupta@gmail.com', '$2a$10$rZ8qNX5Z5Z5Z5Z5Z5Z5Z5uK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Aditya Gupta', 'Blockchain Developer | Web3 Enthusiast. Building decentralized applications for the future.', '+91-9876543217', 2021, 'B.Tech', 'Computer Science', 'Blockchain Developer', 'Polygon',
'{"city": "Bangalore", "state": "Karnataka", "country": "India"}',
'{"linkedin": "https://linkedin.com/in/adityagupta", "github": "https://github.com/adityagupta", "twitter": "https://twitter.com/adityaweb3"}',
ARRAY['Solidity', 'Ethereum', 'Web3.js', 'Smart Contracts', 'JavaScript', 'React'],
ARRAY['Blockchain', 'Crypto', 'Gaming', 'Tech Meetups'],
true, true),

('meera.krishnan@gmail.com', '$2a$10$rZ8qNX5Z5Z5Z5Z5Z5Z5Z5uK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Meera Krishnan', 'Mobile App Developer at PhonePe. Flutter expert. Building apps used by millions of Indians.', '+91-9876543218', 2018, 'B.Tech', 'Computer Science', 'Senior Mobile Developer', 'PhonePe',
'{"city": "Bangalore", "state": "Karnataka", "country": "India"}',
'{"linkedin": "https://linkedin.com/in/meerakrishnan", "github": "https://github.com/meerakrishnan"}',
ARRAY['Flutter', 'Dart', 'Firebase', 'iOS', 'Android', 'React Native'],
ARRAY['Mobile Development', 'Dance', 'Travel', 'Food'],
true, true),

('rohan.malhotra@gmail.com', '$2a$10$rZ8qNX5Z5Z5Z5Z5Z5Z5Z5uK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Rohan Malhotra', 'Startup Founder | Ex-McKinsey. Building EdTech solutions for rural India. Angel investor.', '+91-9876543219', 2014, 'MBA', 'Business Administration', 'Founder & CEO', 'LearnHub India',
'{"city": "Gurgaon", "state": "Haryana", "country": "India"}',
'{"linkedin": "https://linkedin.com/in/rohanmalhotra", "twitter": "https://twitter.com/rohanmalhotra"}',
ARRAY['Business Strategy', 'Product Management', 'Fundraising', 'Leadership'],
ARRAY['Entrepreneurship', 'Education', 'Investing', 'Golf'],
true, true);

-- Insert Events (using email to reference users - will be linked after)
-- We'll use a temp table to store user IDs
DO $$
DECLARE
    priya_id UUID;
    rahul_id UUID;
    ananya_id UUID;
    sneha_id UUID;
    rohan_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO priya_id FROM users WHERE email = 'priya.sharma@gmail.com';
    SELECT id INTO rahul_id FROM users WHERE email = 'rahul.verma@gmail.com';
    SELECT id INTO ananya_id FROM users WHERE email = 'ananya.iyer@gmail.com';
    SELECT id INTO sneha_id FROM users WHERE email = 'sneha.reddy@gmail.com';
    SELECT id INTO rohan_id FROM users WHERE email = 'rohan.malhotra@gmail.com';

    -- Insert Events
    INSERT INTO events (title, description, event_type, start_date, end_date, location, is_virtual, virtual_link, max_attendees, is_public, created_by) VALUES
    ('Tech Talk: AI in Healthcare', 'Join us for an insightful discussion on how AI is transforming healthcare in India. Industry experts will share their experiences.', 'Workshop', '2025-11-15 18:00:00+05:30', '2025-11-15 20:00:00+05:30',
    '{"venue": "IIT Delhi Auditorium", "city": "New Delhi", "state": "Delhi", "country": "India"}',
    false, null, 200, true, priya_id),

    ('Alumni Meetup Bangalore 2025', 'Annual alumni gathering in Bangalore. Network with fellow alumni, share experiences, and enjoy good food!', 'Networking', '2025-12-01 17:00:00+05:30', '2025-12-01 21:00:00+05:30',
    '{"venue": "Taj West End", "city": "Bangalore", "state": "Karnataka", "country": "India"}',
    false, null, 150, true, rahul_id),

    ('Career Guidance Webinar', 'Free webinar for final year students. Learn about career paths in tech, interview tips, and resume building.', 'Webinar', '2025-11-20 19:00:00+05:30', '2025-11-20 21:00:00+05:30',
    '{"virtual": true}',
    true, 'https://meet.google.com/abc-defg-hij', 500, true, ananya_id),

    ('Diwali Celebration 2025', 'Celebrate Diwali with the alumni community! Cultural performances, games, and traditional dinner.', 'Social', '2025-11-10 18:00:00+05:30', '2025-11-10 22:00:00+05:30',
    '{"venue": "Leela Palace", "city": "Mumbai", "state": "Maharashtra", "country": "India"}',
    false, null, 100, true, sneha_id),

    ('Startup Pitch Day', 'Alumni startups pitch their ideas to investors. Great networking opportunity for entrepreneurs and investors.', 'Conference', '2025-12-15 10:00:00+05:30', '2025-12-15 17:00:00+05:30',
    '{"venue": "91Springboard", "city": "Pune", "state": "Maharashtra", "country": "India"}',
    false, null, 80, true, rohan_id);

    -- Insert Jobs
    INSERT INTO jobs (title, description, company, location, job_type, experience_level, salary_range, skills_required, application_deadline, is_active, posted_by) VALUES
    ('Senior Full Stack Developer', 'We are looking for an experienced Full Stack Developer to join our team in Bangalore. Work on cutting-edge fintech products.', 'Razorpay',
    '{"city": "Bangalore", "state": "Karnataka", "country": "India"}',
    'Full-time', 'Senior', '{"min": 2000000, "max": 3500000, "currency": "INR"}',
    ARRAY['React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
    '2025-12-31 23:59:59+05:30', true, rahul_id),

    ('Data Scientist - NLP', 'Join our AI team to work on Natural Language Processing projects. Experience with Indian languages is a plus.', 'Flipkart',
    '{"city": "Bangalore", "state": "Karnataka", "country": "India"}',
    'Full-time', 'Mid-level', '{"min": 1800000, "max": 2800000, "currency": "INR"}',
    ARRAY['Python', 'NLP', 'TensorFlow', 'PyTorch', 'Machine Learning'],
    '2025-11-30 23:59:59+05:30', true, priya_id),

    ('Product Manager - Payments', 'Lead product development for our payments platform. 3+ years of PM experience required.', 'Paytm',
    '{"city": "Noida", "state": "Uttar Pradesh", "country": "India"}',
    'Full-time', 'Senior', '{"min": 2500000, "max": 4000000, "currency": "INR"}',
    ARRAY['Product Management', 'Agile', 'Analytics', 'SQL'],
    '2025-12-15 23:59:59+05:30', true, rahul_id),

    ('UX Designer', 'Design delightful experiences for millions of users. Portfolio required.', 'Swiggy',
    '{"city": "Bangalore", "state": "Karnataka", "country": "India"}',
    'Full-time', 'Mid-level', '{"min": 1500000, "max": 2500000, "currency": "INR"}',
    ARRAY['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    '2025-11-25 23:59:59+05:30', true, sneha_id);

END $$;

-- Success message
SELECT 'Seed data inserted successfully! 🎉' as status,
       (SELECT COUNT(*) FROM users) as total_users,
       (SELECT COUNT(*) FROM events) as total_events,
       (SELECT COUNT(*) FROM jobs) as total_jobs;
