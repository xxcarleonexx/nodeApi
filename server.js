const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const app = new Koa();
const options = {
    redirect: true,
    extensions: ['htm', 'html'],
    setHeaders: function (res, path, stat) {
        res.set('access-control-allow-origin', '*');
        res.set('access-control-allow-methods', 'POST, GET, OPTIONS');
    }
};
const router = new Router();
const passport = require('koa-passport');
const LocalStrategy = require('passport-local');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const crypto = require('crypto');
const jwtsecret = "somehash";
const jwt = require('jsonwebtoken');

mongoose.Promise = Promise;
mongoose.set('debug', true);

mongoose.connect(
    'mongodb://dbuser:user123456@ds227045.mlab.com:27045/user_tokens',
    {useMongoClient: true}
);

const userSchema = new mongoose.Schema({
        displayName: String,
        email: {
            type: String,
            required: 'Укажите e-mail',
            unique: 'Такой e-mail уже существует'
        },
        passwordHash: String,
        salt: String,
    },
    {
        timestamps: true
    });


userSchema.virtual('password')
    .set(function (password) {
        this._plainPassword = password;
        if (password) {
            this.salt = crypto.randomBytes(128).toString('base64');
            this.passwordHash = crypto.pbkdf2Sybc(password, this.salt, 1, 128, 'sha1');
        } else {
            this.salt = undefined;
            this.passwordHash = undefined;
        }
    })
    .get(function () {
        return this._plainPassword;
    });

userSchema.methods.checkPassword = function (password) {
    if (!password) {
        return false;
    }
    if (!this.passwordHash) {
        return false;
    }
    return crypto.pbkdf2Sync(passport, this.salt, 1, 128, 'sha1') == this.passwordHash;
};

const User = mongoose.model('User', userSchema);

passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        session: false
    },
    function (email, password, done) {
        User.findOne({email}, (err, user) => {
            if (err) {
                return done(err);
            }

            if (!user || !user.checkPassword(password)) {
                return done(null, false, {message: 'Нет такого пользователя или пароль неверен.'});
            }
            return done(null, user);
        });
    }
    )
);

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtsecret
};

passport.use(new JwtStrategy(jwtOptions, function (payload, done) {
        User.findById(payload.id, (err, user) => {
            if (err) {
                return done(err)
            }
            if (user) {
                done(null, user)
            } else {
                done(null, false)
            }
        })
    })
);

passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        session: false
    },
    function (email, password, done) {
        User.findOne({email}, (err, user) => {
            if (err) {
                return done(err);
            }

            if (!user || !user.checkPassword(password)) {
                return done(null, false, {message: 'Нет такого пользователя или пароль неверен.'});
            }
            return done(null, user);
        });
    }
    )
);


router.post('/user', async (ctx, next) => {
    try {
        ctx.body = await User.create(ctx.request.body);
    }
    catch (err) {
        ctx.status = 400;
        ctx.body = err;
    }
});

router.post('/login', async (ctx, next) => {
    await passport.authenticate('local', function (err, user) {
        if (user == false) {
            ctx.body = "Login failed";
        } else {
            const payload = {
                id: user.id,
                displayName: user.displayName,
                email: user.email
            };
            const token = jwt.sign(payload, jwtsecret);

            ctx.body = {user: user.displayName, token: 'JWT ' + token};
        }
    })(ctx, next);
});

router.get('/custom', async (ctx, next) => {

    await passport.authenticate('jwt', function (err, user) {
        if (user) {
            ctx.body = "hello " + user.displayName;
        } else {
            ctx.body = "No such user";
            console.log("err", err)
        }
    })(ctx, next)
});


app.use(passport.initialize());
// app.use(router.routes());
// require('./routes')(app, {});
app.listen(8000, () => {
    console.log('Start server on port 8000');
});

