CREATE TABLE user (
    user_id VARCHAR(8) PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_password VARCHAR(255) NOT NULL
);

CREATE TABLE jokes (
	jokes_id VARCHAR(8) PRIMARY KEY, 
	jokes_question VARCHAR(1000) NOT NULL,
	jokes_answer VARCHAR(1000) NOT NULL,
	jokes_user VARCHAR(8) NOT NULL,
	FOREIGN KEY (jokes_user) REFERENCES user(user_id)
);

CREATE TABLE likes (
	likes_id VARCHAR(8) PRIMARY KEY, 
	likes_user VARCHAR(8) NOT NULL,
    likes_joke VARCHAR(8) NOT NULL,
    FOREIGN KEY (likes_joke) REFERENCES jokes(jokes_id),
	FOREIGN KEY (likes_user) REFERENCES user(user_id)
);

CREATE TABLE comment (
	comment_id VARCHAR(8) PRIMARY KEY,
	comment_joke VARCHAR(8) NOT NULL,
	comment_user VARCHAR(8) NOT NULL,
	comment_content VARCHAR(1000) NOT NULL,
	comment_timestamp DATETIME NOT NULL,
	FOREIGN KEY (comment_joke) REFERENCES jokes(jokes_id),
	FOREIGN KEY (comment_user) REFERENCES user(user_id)
);