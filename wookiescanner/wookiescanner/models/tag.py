from wookiescanner.extensions import db
from wookiescanner.models.relationships import tags_posts
from wookiescanner.database import (
    Model,
    SurrogatePK,
)


class Tag(SurrogatePK, Model):

    __tablename__ = 'tags'

    tag = db.Column(db.Text)
    posts = db.relationship('Post', secondary=tags_posts, backref=db.backref('tags_br', lazy='dynamic'))

    def __init__(self, tag, **kwargs):
        db.Model.__init__(self, tag=tag, **kwargs)