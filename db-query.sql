CREATE TABLE Users (
  userId CHAR(11) NOT NULL PRIMARY KEY,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phoneNumber VARCHAR(15) NOT NULL,
  address VARCHAR(255) NOT NULL,
  image BYTEA,
  userType VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (userType IN ('admin', 'user')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE FinancialPlatform (
  platformId CHAR(11) NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255) NOT NULL,
  iconImage BYTEA
);

CREATE TABLE ExpenseCategory (
  categoryId CHAR(11) NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255) NOT NULL,
  codepoint INTEGER,
  fontfamily VARCHAR(100) NOT NULL,
  color INTEGER
  budget DECIMAL(10, 2) NOT NULL,
  iconImage BYTEA
);


CREATE TABLE Expense (
  expenseId CHAR(11) NOT NULL PRIMARY KEY,
  receipt BYTEA,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  userId CHAR(11) NOT NULL,
  platformId CHAR(11) NOT NULL,
  categoryId CHAR(11) NOT NULL,
  FOREIGN KEY (userId) REFERENCES Users(userId),
  FOREIGN KEY (platformId) REFERENCES FinancialPlatform(platformId),
  FOREIGN KEY (categoryId) REFERENCES ExpenseCategory(categoryId)
);

CREATE TABLE Notification (
  notificationId CHAR(11) NOT NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(10) NOT NULL DEFAULT 'alert' CHECK (type IN ('expense', 'alert')),
  description VARCHAR(255) NOT NULL,
  image BYTEA,
  date DATE NOT NULL,
  time TIME,
  userId CHAR(11) NOT NULL,
  PRIMARY KEY (notificationId),
  FOREIGN KEY (userId) REFERENCES Users(userId)
);

CREATE TABLE TaxRelief (
  taxReliefId CHAR(11) NOT NULL,
  reliefCategory VARCHAR(100) NOT NULL,
  description VARCHAR(255) NOT NULL,
  reliefAmount DECIMAL(10, 2) NOT NULL,
  restrictions VARCHAR(255) NOT NULL,
  userId CHAR(11) NOT NULL,
  PRIMARY KEY (taxReliefId),
  FOREIGN KEY (userId) REFERENCES Users(userId)
);

CREATE TABLE UserNotification (
  userId CHAR NOT NULL,
  notificationId CHAR NOT NULL,
  PRIMARY KEY (userId, notificationId),
  FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE,
  FOREIGN KEY (notificationId) REFERENCES Notification(notificationId) ON DELETE CASCADE
);

CREATE TABLE EligibleExpenses (
  expenseId CHAR(11) NOT NULL,
  taxReliefId CHAR(11) NOT NULL,
  PRIMARY KEY (expenseId, taxReliefId),
  FOREIGN KEY (expenseId) REFERENCES Expense(expenseId) ON DELETE CASCADE,
  FOREIGN KEY (taxReliefId) REFERENCES TaxRelief(taxReliefId) ON DELETE CASCADE
);

CREATE TABLE UserActivityLog (
  logId SERIAL PRIMARY KEY,
  userId CHAR NOT NULL,
  featureName VARCHAR(100) NOT NULL,
  actionType VARCHAR(50),
  activityDescription TEXT,
  startTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  endTime TIMESTAMP,
  deviceInfo VARCHAR(255),
  FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE
);

CREATE TABLE Item (
  itemId CHAR(11) NOT NULL PRIMARY KEY ,
  name VARCHAR(100) NOT NULL,
  unit VARCHAR(255) NOT NULL,
  item_group VARCHAR(255) NOT NULL,
  item_category CHAR(11) NOT NULL,
  image BYTEA
);

CREATE TABLE Premise (
  premiseId CHAR(11) NOT NULL PRIMARY KEY ,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  image BYTEA
);

CREATE TABLE Price (
  premiseId CHAR(11) NOT NULL PRIMARY KEY ,
  itemId CHAR(11) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  FOREIGN KEY (premiseId) REFERENCES Premise(premiseId) ON DELETE CASCADE,
  FOREIGN KEY (itemId) REFERENCES Item(itemId) ON DELETE CASCADE
);

INSERT INTO public.Expensecategory (categoryid, name, description, codepoint, fontfamily, color) VALUES
(1, 'Food', 'Groceries, Restaurants, Snacks', 61513, 'MaterialIcons', 4294945600),
(2, 'Transportation', 'Travel, Fuel, Parking', 61473, 'MaterialIcons', 4279060385),
(3, 'Entertainment', 'Movies, Music, Games, Dining out', 62606, 'MaterialIcons', 4284809178),
(4, 'Housing', 'Rent, Utilities, Home Improvements', 61716, 'MaterialIcons', 4286141768),
(5, 'Shopping', 'Clothing, Electronics, Accessories', 62335, 'MaterialIcons', 4294929984),
(6, 'Healthcare', 'Medical Appointments, Prescriptions', 61822, 'MaterialIcons', 4294198070),
(7, 'Personal', 'Hobbies, Gifts, Donations', 62074, 'MaterialIcons', 4282682111),
(8, 'Education', 'Tuition Fees, Books', 62268, 'MaterialIcons', 4294945600),
(9, 'Savings', 'Savings for future goals', 984956, 'MaterialIcons', 4283215696),
(10, 'Other', 'Miscellaneous expenses', 61927, 'MaterialIcons', 4288585374);