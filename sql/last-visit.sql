-- SQL does not support DEFAULT(CURRENT_DATE)... makes no sense
CREATE TABLE `LastVisit` (
  `ID` int(11) DEFAULT NULL,
  `date` DATE NOT NULL,
  `user` int(11) DEFAULT NULL,
) ENGINE=MyISAM DEFAULT CHARSET=latin1; 

CREATE TABLE `Indices` (
  `ID` int(11) DEFAULT NULL,
  `user` int(11) DEFAULT NULL,
  `index` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1; 