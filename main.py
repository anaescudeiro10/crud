from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_bcrypt import generate_password_hash, check_password_hash
import fdb

app = Flask(__name__)
app.secret_key = "Farmacia123"



def conectar():
    return fdb.connect(
        dsn="C:Users\Aluno\Downloads\BANCO\BANCO.FDB",
        user="SYSDBA",
        password="sysdba",)

    con = fdb.connect(host=host, database=database, user=user, password=password)

@app.route("/")
def index():
    return render_template("index.html")


# -------------------- LOGIN ------------------------

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        nome = request.form["nome"]
        senha = request.form["senha"]

        con = conectar()
        cur = con.cursor()
        cur.execute("SELECT SENHA FROM USUARIOS WHERE NOME = ?", (nome,))
        resultado = cur.fetchone()

        if resultado and check_password_hash(resultado[0], senha):
            session["usuario"] = nome
            return redirect(url_for("dashboard.html"))
        else:
            flash("Usuário ou senha inválidos!")

    return render_template("login.html")


# ---------------- CADASTRO DE USUÁRIOS --------------

@app.route("/cadastrar", methods=["GET", "POST"])
def cadastrar():
    if request.method == "POST":
        nome = request.form["nome"]
        senha = generate_password_hash(request.form["senha"]).decode("utf-8")

        con = conectar()
        cur = con.cursor()

        try:
            cur.execute("INSERT INTO USUARIOS (NOME, SENHA) VALUES (?, ?)", (nome, senha))
            con.commit()
            flash("Usuário criado com sucesso!")
            return redirect(url_for("login"))
        except:
            flash("Usuário já existe!")

    return render_template("cadastrar.html")


# -------------------- LOGOUT ------------------------

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("index"))


# -------------------- DASHBOARD ---------------------

@app.route("/dashboard")
def dashboard():
    if "usuario" not in session:
        return redirect(url_for("login"))
    return render_template("dashboard.html", usuario=session["usuario"])


# ----------------------- CRUD ------------------------

@app.route("/produtos")
def produtos():
    con = conectar()
    cur = con.cursor()
    cur.execute("SELECT * FROM PRODUTOS")
    lista = cur.fetchall()
    return render_template("listar.html", produtos=lista)


@app.route("/adicionar", methods=["POST"])
def adicionar():
    nome = request.form["nome"]
    preco = request.form["preco"]

    con = conectar()
    cur = con.cursor()
    cur.execute("INSERT INTO PRODUTOS (NOME, PRECO) VALUES (?, ?)", (nome, preco))
    con.commit()

    return redirect(url_for("produtos"))


@app.route("/editar/<int:id>", methods=["GET", "POST"])
def editar(id):
    con = conectar()
    cur = con.cursor()

    if request.method == "POST":
        nome = request.form["nome"]
        preco = request.form["preco"]

        cur.execute("UPDATE PRODUTOS SET NOME=?, PRECO=? WHERE ID=?", (nome, preco, id))
        con.commit()
        return redirect(url_for("produtos"))

    cur.execute("SELECT * FROM PRODUTOS WHERE ID=?", (id,))
    produto = cur.fetchone()

    return render_template("editar.html", produto=produto)


@app.route("/excluir/<int:id>")
def excluir(id):
    con = conectar()
    cur = con.cursor()
    cur.execute("DELETE FROM PRODUTOS WHERE ID=?", (id,))
    con.commit()
    return redirect(url_for("produtos"))


if __name__ == "__main__":
    app.run(debug=True)
