exports.post = function (req, res, next){
    var login = req.body.login,
        password = req.body.password;
    if ((login == 'superuser') && (password == 'password')){
        res.sendFile('D:\\Projects\\NodeJS\\CurChart-v3\\console.log');
    } else {
        var error = new Error('Неверный логин/пароль', 404);
        next(error);
    }
};