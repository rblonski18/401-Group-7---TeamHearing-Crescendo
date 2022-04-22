-- SQL does not support DEFAULT(CURRENT_DATE)... makes no sense
CREATE TABLE playlist (
  ID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  entry DATE NOT NULL,
  user INT NOT NULL UNIQUE,
  playlist VARCHAR(64) NOT NULL
); 