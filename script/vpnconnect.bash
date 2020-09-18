#!/bin/bash

set -u

if [ -e .env ]; then
    while read line;do if [ -n "$line" ];then export "$line"; fi done < .env
fi

vpn="${1:-${VPN_NAME}}"

function is_connected() {
    scutil --nc status "$1" | sed -n 1p | grep -qv "Connected"
}

function is_disconnected() {
    scutil --nc status "$1" | sed -n 1p | grep -q "Disconnected"
}

function poll_until_connected() {
    let loops=0 || true
    let max_loops=200 # 200 * 0.1 is 20 seconds. Bash doesn't support floats

    while is_connected "$vpn"; do
        sleep 0.1 # can't use a variable here, bash doesn't have floats
        let loops=$loops+1
        [ $loops -gt $max_loops ] && break
    done

    [ $loops -le $max_loops ]
}

function poll_until_disconnected() {
    let loops=0 || true
    let max_loops=200 # 200 * 0.1 is 20 seconds. Bash doesn't support floats

    while is_disconnected "$vpn"; do
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

    if poll_until_disconnected "$vpn"; then
        echo "Disconnected to $vpn!"
        return 0
    else
        echo "I'm too impatient!"
        return 1
    fi
}

if [ $# -eq 2 ]; then
    eval ${2}
else
    if is_disconnected "$vpn"; then
        connect
    else
        disconnect
    fi
fi
