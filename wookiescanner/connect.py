import sqlite3
class Database:
	def __init__(self,filename):
		try:
			if filename:
				self.filename = filename
			else:
				return None
		except:
			return None

	def Establish_connection(self):
		try:
			conn = sqlite3.connect(self.filename)
			return conn
		except:
			return None
