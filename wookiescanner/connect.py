import sqlite3
class Database:
	def __init__(self,filename):
		try:
			if filename:
				self.filename = filename
			else:
				return None
		except Exception:
			return None

	def Establish_connection(self):
		try:
			with open(self.filename,'r') as dbfile:
				conn = sqlite3.connect(dbfile)
			return conn
		except Exception:
			return None
