# -*- coding: utf-8 -*-
"""Public section, including homepage and signup."""
from flask import (Blueprint, request, render_template, flash, url_for, send_from_directory, make_response,
                   redirect, current_app,jsonify)
import datetime
from connect import Database
from flask_login import login_user, login_required, logout_user

from wookiescanner.extensions import login_manager
from wookiescanner.models.user import User
from wookiescanner.forms.public import LoginForm
from wookiescanner.forms.user import RegisterForm
from wookiescanner.utils import flash_errors, render_extensions
from wookiescanner.database import db
import wookiescanner.exclude_classes as exc_py

blueprint = Blueprint('public', __name__, static_folder="../static")
start =0
start1=0
filterStart =0
@login_manager.user_loader
def load_user(id):
    return User.get_by_id(int(id))


@blueprint.route("/", methods=["GET", "POST"])
def home():
    form = LoginForm(request.form)
    # Handle logging in
    if request.method == 'POST':
        if form.validate_on_submit():
            login_user(form.user)
            flash("You are logged in.", 'success')
            redirect_url = request.args.get("next") or url_for("user.profile")
            return redirect(redirect_url)
        else:
            flash_errors(form)
    return render_extensions("public/home.html", form=form)


@blueprint.route('/logout/')
@login_required
def logout():
    logout_user()
    flash('You are logged out.', 'info')
    return redirect(url_for('public.home'))


@blueprint.route("/register/", methods=['GET', 'POST'])
def register():
    form = RegisterForm(request.form, csrf_enabled=False)
    if form.validate_on_submit():
        new_user = User.create(username=form.username.data,
                               first_name=form.first_name.data,
                               last_name=form.last_name.data,
                               email=form.email.data,
                               password=form.password.data,
                               active=True)
        flash("Thank you for registering. You can now log in.", 'success')
        return redirect(url_for('public.home'))
    else:
        flash_errors(form)
    return render_extensions('public/register.html', form=form)


@blueprint.route("/about/")
def about():
    form = LoginForm(request.form)
    return render_extensions("public/about.html", form=form)

@blueprint.route('/robots.txt')
@blueprint.route('/favicon.ico')
def static_from_root():
    return send_from_directory(current_app.static_folder, request.path[1:])


@blueprint.route('/sitemap.xml', methods=['GET'])
def sitemap():
    """
    Generate sitemap.xml. Makes a list of urls and date modified.
    """
    pages = []
    ten_days_ago = datetime.datetime.now() - datetime.timedelta(days=10)
    ten_days_ago = ten_days_ago.date().isoformat()
    # static pages
    for rule in current_app.url_map.iter_rules():
        if "GET" in rule.methods and len(rule.arguments) == 0:
            pages.append([rule.rule, ten_days_ago])

    sitemap_xml = render_template('public/sitemap_template.xml', pages=pages)
    response = make_response(sitemap_xml)
    response.headers["Content-Type"] = "application/xml"

    return response


@blueprint.route('/receive',methods=['POST','GET'])
def response():
    __summary__ = {}
    __cveid__ = {}
    __pages__ =False
    if request.method =="POST":
        __modules__  = request.form['data'].split(',')
        if __modules__ is not None:
            db=Database("database/vfeed.db")
            __conn__ = db.Establish_connection()
            if __conn__:                                                    # Got a database connection
                for item in __modules__:                                  # check every module in module list
                    if item is not None:                                    # and item not in excludes:
                        __summary__[item] =[]                               # save this module to the summary dictionary with empty list
                        __cveid__[item] =[]
                for item in __modules__:
                    if(item != ""):
                        total_rows_query = "select count(*) from nvd_db where summary like '%{0}%'".format(item)
                        cur = __conn__.execute(total_rows_query)
                        total_rows = cur.fetchone()
                        total_pages = total_rows[0] // 10
                        if(total_pages > 10):
                            __pages__=True

                        query = "select cveid,date_published,date_modified,summary from nvd_db where summary like '%{0}%' limit 0,10".format(item)
                        cur = __conn__.execute(query)
                        rows = cur.fetchall()
                        if rows:
                            for row in rows:
                              __summary__[item].append(row)
                __conn__.close()
                return render_template('public/home.html',__summary__=__summary__,pages=__pages__,error=0)
            else:
                flash("Error connecting database","success")
                return redirect(url_for('public.home'))
        else:
            return render_template("401.html",error="No modules found" ,summary=0)
    flash("Get Method not supported","success")
    # else:
    return redirect(url_for('public.home'))

    # return render_template('500.html',error ="Get method not supported",summary=0)


@blueprint.route('/process',methods=['POST','GET'])
def process():
    if request.method == "POST":
        module = request.form['module']
        check = request.form['check']
        __pages__ =False
        if module.lower() not in exc_py.python_excludes():
            __summary__ = {}
            __summary__[module] =[]
            db=Database("database/vfeed.db")
            __conn__ = db.Establish_connection()
            if __conn__:
                total_rows_query = "select count(*) from nvd_db where summary like '%{0}%'".format(module)
                cur = __conn__.execute(total_rows_query)
                total_rows = cur.fetchone()
                total_pages = total_rows[0] // 10
                if(total_pages > 10):
                    __pages__=True

                query = "select cveid,date_published,date_modified,summary from nvd_db where {0} like '%{1}%' limit 0,10".format(check,module)

                cur = __conn__.execute(query)
                rows = cur.fetchall()
                __conn__.close()
                for row in rows:
                    __summary__[module].append(row)
                return render_template("public/home.html",__summary__=__summary__,error=0,pages=__pages__)
            else:
                flash("Database Error","success");
                return redirect(url_for('public.home'));
                # return render_template("500.html",summary=0,error="Database Error")
        else:
            flash("No Vulnerability found","success")
            return redirect(url_for('public.home'))
            # return render_template("401.html",summary=0,error="No Vulnerability found")
    else:
        flash("GET method not supported")
        return redirect(url_for('public.home'))
        # return render_template("401.html",summary=0,error="Get method not supported")


# ------------------------------------this route is unused-----------------------------------
@blueprint.route('/process_ajax',methods=['GET'])
def process_ajax():
    global start
    start = start + 10
    module = request.args.get('a')
    if request.method == "GET":
        __summary__ = {}
        __summary__[module] =[]
        db=Database("database/vfeed.db")
        __conn__ = db.Establish_connection()
        if __conn__:
            query = "select cveid,date_published,date_modified,summary from nvd_db where summary like '%{0}%' limit {1},10".format(module,start)
            cur = __conn__.execute(query)
            rows = cur.fetchall()
            __conn__.close()
            for row in rows:
                __summary__[module].append(row)
            return jsonify(result=__summary__)
            # return jsonify('result',render_template('public/home.html',summary=__summary__))
#------------------------------------------------------------------------------------------------


@blueprint.route('/process_next',methods=['GET','POST'])
def process_next():
    global start
    start = start +10
    if request.method == "POST":
        __summary__ ={}
        __cveid__ ={}
        __modules__ = []
        __modules__  = request.form['next'].split(',')
        __pages__ =False
        pages =0
        if __modules__ is not None:
            db=Database("database/vfeed.db")
            __conn__ = db.Establish_connection()
            if __conn__:                                                    # Got a database connection
                for item in __modules__ :                                  # check every module in module list
                    __summary__[item] =[]                               # save this module to the summary dictionary with empty list
                    __cveid__[item] =[]
                for item in __modules__:
                    if(item != ""):
                        total_rows_query = "select count(*) from nvd_db where summary like '%{0}%'".format(item)
                        cur = __conn__.execute(total_rows_query)
                        total_rows = cur.fetchone()      #             returns a tuple
                        total_pages = total_rows[0] // 10

                        if total_pages - start > 10:
                            pages = pages + int(total_pages)

                            if start > pages:
                                start = 0
                            else:
                                __pages__ = True

                        query = "select cveid,date_published,date_modified,summary from nvd_db where summary like '%{0}%' limit {1},10 ".format(item,start)
                        cur = __conn__.execute(query)
                        rows = cur.fetchall()
                        for row in rows:
                            __summary__[item].append([row[0],row[1],row[2],row[3]])
                __conn__.close()
                return render_template('public/home.html',__summary__ = __summary__,error=0,pages=__pages__)
            else:
                return render_template('500.html',error="Error connecting Database",summary=0)
        else:
            return render_template("401.html",error="No modules found" ,summary=0)
    else:
        return render_template("401.html",error="Get Method Not Supported");


@blueprint.route('/process_previous',methods=['GET','POST'])
def process_previous():
    global start
    if(start!=0 and not start <0):
        start = start -10

    if request.method == "POST":
        __summary__ ={}
        __cveid__ ={}
        __modules__ = []
        __modules__  = request.form['previous'].split(',')
        __pages__ = False

        if __modules__ is not None:
            db=Database("database/vfeed.db")
            __conn__ = db.Establish_connection()
            if __conn__:                                                    # Got a database connection
                for item in __modules__ :                                  # check every module in module list
                    __summary__[item] =[]                               # save this module to the summary dictionary with empty list
                    __cveid__[item] =[]
                for item in __modules__:
                    if(item != ""):
                        total_rows_query = "select count(*) from nvd_db where summary like '%{0}%' ".format(item)
                        cur = __conn__.execute(total_rows_query)
                        total_rows = cur.fetchone()
                        total_pages = total_rows[0] // 10
                        if(int(total_pages) > 10):
                            __pages__ =True

                        query = "select cveid,date_published,date_modified,summary from nvd_db where summary like '%{0}%' limit {1},10 ".format(item,start)
                        cur = __conn__.execute(query)
                        rows = cur.fetchall()
                        for row in rows:
                            __summary__[item].append([row[0],row[1],row[2],row[3]])
                __conn__.close()
                return render_template('public/home.html',__summary__ = __summary__,pages=__pages__,error=0)
            else:
                return render_template('500.html',error="Error connecting Database",summary=0)
        else:
            return render_template("401.html",error="No modules found" ,summary=0)
    else:
        return render_template("401.html",error="Get Method Not Supported");

@blueprint.route('/filter',methods=['GET','POST'])
def filter():
    global filterStart

    if request.method == "POST":
        __filterBY__ = request.form['filter']
        __modu__     = request.form['modules']
        __summary__ = {}
        __modules__  = __modu__.split(',')
        for item in __modules__:
            __summary__[item] =[]
        db=Database("database/vfeed.db")
        __conn__ = db.Establish_connection()
        if __modules__ is not None:
            for item in __modules__:
                if(item != " " and __conn__):
                    query = "select cveid,date_published,date_modified,summary from nvd_db where summary like '%{0}%'  order by {1} desc limit {2},10".format(item,__filterBY__,filterStart)
                    # query = "select cveid,date_published,date_modified,summary from nvd_db where summary like '% microsoft%' order by cveid limit 10"

                    cur = __conn__.execute(query)
                    rows = cur.fetchall()
                    for row in rows:
                        __summary__[item].append(row)
            __conn__.close()
            return render_template('public/home.html',__summary__ = __summary__,error=0)
        return render_template('public/test.html',filter=__filterBY__,modules =__modules__)
