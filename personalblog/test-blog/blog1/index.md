---
title: "I am blog1"

date: "2025-01-01"
tags: ["Fish"]
img: ["img1.JPG", "img2.JPG", "img3.JPG"]
---


# T700 Progress

I apologise for the lack of sizeable updates in the past few months. Unfortunately the T700 project has not been smooth sailing, primarily due to Shenzhen and other Chinese cities under major lockdowns.

I’ve received a prototype and the board is working well. Board production has also finished and the boards are ready to ship once we are satisfied software issues are cleared up. There are two primary issues with the board which are explained below.

# Battery detection

The ODM we are working with are really not great at designing battery controllers. For now, there seem to be capacity detection issue and current issues. The EC is the ITE5671E-128 and the ODM has kindly provided us with the battery code as well as the full schematics of the motherboard. Unfortunately, most of it is still licensed from ITE so I am unable to put it up publicly online, not to mention I am unable to compile the code. The code and schematics will be available to all preorders as well as devs who are interested in taking on this issue. One idea is to take the code supplied and use that to aid in reverse-engineering the EC code. The EC firmware is also on a separate EEPROM away from the main BIOS. As the full schematics is provided, it will be a lot easier to rewrite parts of the firmware.

# Thunderbolt 4

The other issue is the Thunderbolt 4 port. We are unable to figure out the power control for this chip due to lack of support by Intel and unfortunately if this continues on, we are forced to abandon the port. As the Thunderbolt port is completely proprietary and supported by Intel currently, we are unable to progress much without more help from Intel. All the hardware for Thunderbolt 4 is already present on the machine and if anyone wants to take a stab at it once it’s shipped, feel free.

# My Apology

I apologise for being MIA for the past 2 months. I had some family trouble and I took an unscheduled break from life. I apologise to everyone who had ordered from me and had issues reaching out and I’m going through my inbox as we speak. Life is difficult sometimes and I hope you understand my situation.

School has also restarted for me and the resumption of full physical classes is taking a huge bite out of my limited time as well. As such, I have removed my Telegram handle as well as WhatsApp from my main page. I am still contactable through these channels but I will only accept new orders via my Signal and email from now on. My Instagram and Facebook is active as well but I will not be actively replying as well. This is not a full-time job for me for now and until I finish school, this is unfortunately the most amount of effort I can offer for this website.

I am however promising full communications and support for everyone who has already placed an order. I am not taking on as many new orders to focus more on the T700 as well as existing orders.

TPs and hardware hacking is still a passion of mine and it’s burning as bright as ever.

&nbsp;

# Lockdowns in China

Lockdowns are a mess in China. It’s absolutely destroying the electronics market in China and my hometown had been placed in quarantine for close to a month in August/September. Shenzhen was also placed in quarantine and only reopened this month. My friends and suppliers are all telling me that part pricing have skyrocketed and even international shipping has been affected. Shipping is thus subject to availability but for now, it’s in the clear.

&nbsp;

# Other Projects

The other projects listed in my other posts are still ongoing. I am taking the extra time to improve on whatever projects I’m working on. The X230 project is probably on hold until I finish school (approximately winter 2023). Until then, I will be putting in more effort and time to upgrade myself.

