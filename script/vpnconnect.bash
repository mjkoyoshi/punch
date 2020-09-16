#!/bin/bash

set -u

if [ -e .env ]; then
    while read line;do if [ -n "$line" ];then export "$line"; fi done < .env
fi

vpn="${1:-${VPN_NAME}}"

function isnt_connected () {
    scutil --nc status "$vpn" | sed -n 1p | grep -qv "Connected"
}

function poll_until_connected () {
    let loops=0 || true
    let max_loops=200 # 200 * 0.1 is 20 seconds. Bash doesn't support floats

    while isnt_connected "$vpn"; do
        sleep 0.1 # can't use a variable here, bash doesn't have floats
        let loops=$loops+1
        [ $loops -gt $max_loops ] && break
    done

    [ $loops -le $max_loops ]
}

function connect() {
    echo Connecting "$vpn" ...
    networksetup -connectpppoeservice "$vpn"

    if poll_until_connected "$vpn"; then
        echo "Connected to $vpn!"
        return 0
    else
        echo "I'm too impatient!"
        networksetup -disconnectpppoeservice "$vpn"
        return 1
    fi
}

function disconnect() {
    echo Disconnecting "$vpn" ...
    networksetup -disconnectpppoeservice "$vpn"
}

function is_disconnected() {
    scutil --nc status "$vpn" | sed -n 1p | grep -q "Disconnected"
    return $?
}

is_disconnected
if [ $? -eq 0 ]; then
    connect
else
    disconnect
fi
