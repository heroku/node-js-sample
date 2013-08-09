#!/bin/bash
# Set up postgres db for local debugging.
# 
# Unlike MySQL, PostgreSQL makes it harder to set blank passwords or set
# passwords from the command line.
#
# See here for background:
# stackoverflow.com/questions/5421807/set-blank-password-for-postgresql-user
# dba.stackexchange.com/questions/14740/how-to-use-psql-with-no-password-prompt
# postgresql.1045698.n5.nabble.com/assigning-password-from-script-td1884293.html
#
# Thus what we'll do is use the .pgpass file as our single point of
# truth, for both setting up postgres and then accessing it later via
# sequelize. We can also symlink this file into the home directory.

# Install postgres
sudo apt-get install -y postgresql postgresql-contrib

# Symlink into home.
# Note the use of backticks, PWD, and the -t flag.
ln -sf `ls $PWD/.pgpass` -t $HOME
chmod 600 $HOME"/.pgpass"

# Extract variables from the .pgpass file
# stackoverflow.com/a/5257398
# goo.gl/X51Mwz
PGPASS=`cat .pgpass`
TOKS=(${PGPASS//:/ })
PG_HOST=${TOKS[0]}
PG_PORT=${TOKS[1]}
PG_DB=${TOKS[2]}
PG_USER=${TOKS[3]}
PG_PASS=${TOKS[4]}

# Now set up the users
#
# If you don't type in the password right, easiest is to change the value in
# pgpass and try again. You can also delete the local postgres db
# if you know how to do that. 
echo -e "\n\nINPUT THE FOLLOWING PASSWORD TWICE BELOW: "${PG_PASS}
sudo -u postgres createuser -U postgres -E -P -s $PG_USER
sudo -u postgres createdb -U postgres -O $PG_USER $PG_DB

# Test that it works.
# Note that the symlinking of pgpass into $HOME should pass the password to psql and make these commands work. 
echo "CREATE TABLE phonebook(phone VARCHAR(32), firstname VARCHAR(32), lastname VARCHAR(32), address VARCHAR(64));" | psql -d $PG_DB -U $PG_USER
echo "INSERT INTO phonebook(phone, firstname, lastname, address) VALUES('+1 123 456 7890', 'John', 'Doe', 'North America');" | psql -d $PG_DB -U $PG_USER
