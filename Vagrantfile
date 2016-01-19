# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!

Vagrant.configure("2") do |config|
  config.vm.box = "xplore/ubuntu-14.04"
  config.vm.network "forwarded_port", guest: 80, host: 4567
  config.vm.provision "shell",
    inline: "sed -i 's/DocumentRoot.*/DocumentRoot \\/vagrant/' /etc/apache2/sites-available/default.conf && \
    sed -i 's/php_value.*/# \\0/' /etc/apache2/sites-available/default.conf && \
    service apache2 restart"
end
