# -*- mode: ruby -*-
# vi: set ft=ruby :

# WARNING!!!
# To give you no trouble with networking
# and same time have a guest linux with
# a recent kernel this config requires vagrant >= 1.8.3 (optimistic network if-naming bugfix)
# ubuntu 16.04 LTS still shipps 1.8.1 so better get the .deb of https://www.vagrantup.com/downloads.html

# Design Decisions:
# - app port is set to 31337 - this is used in gunicorn conf and nginx proxy

Vagrant.configure(2) do |config|
  ##########################################
  # Guest OS image
  ##########################################
  config.vm.box = "minimal/xenial64" # 16.04 LTS

  ##########################################
  # Network
  ##########################################
  config.vm.network "private_network", ip: "192.168.42.42" #, auto_config: false
  # config.vm.network "public_network"
  config.vm.host_name = "moodapp.dev"

  ##########################################
  # Virtual Machine settings
  ##########################################
  config.vm.provider "virtualbox" do |vb|
    vb.memory = "1024"
    vb.cpus = "2"
  end

  ##########################################
  # Provision required software and libs
  ##########################################
  config.vm.provision "shell", inline: <<-SHELL
     echo ">>> Installing OS components"
     sudo apt-get update
     sudo apt-get install -y nginx wget python-pip
     sudo pip install --upgrade pip

     echo ">>> Installing Python requirements"
     sudo pip install -r /vagrant/server/requirements.txt

     echo ">>> Insert systemd config"
     sudo ln -s /vagrant/server/mood-app.service /etc/systemd/system/mood-app.service
     sudo ln -s /vagrant/server/mood-app.socket /etc/systemd/system/mood-app.socket
     sudo systemctl enable mood-app.socket
     sudo systemctl enable mood-app.service
     sudo systemctl start mood-app.service

     echo ">>> Reroute nginx default config"
     sudo rm /etc/nginx/sites-available/default
     sudo ln -s /vagrant/server/nginx.dev.conf /etc/nginx/sites-available/default
     sudo service nginx restart


     # install app javascript requirements
     # TODO: Javascript pipeline portability
     # TODO: define Gulp integration for guest
  SHELL
end
