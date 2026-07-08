"""
Driver for the New Era syringe pump over RS-232.

This module provides the NewEraPump class for communicating with
New Era Pump Systems syringe pumps via serial. Supports multi-drop
chain addressing.

Typical usage:
    with NewEraPump("00") as pump:
        response = pump.query("RUN")
"""

import time
from typing import Dict, List

import serial
from serial.tools import list_ports

# New Era pumps use a multi-drop RS-232 chain: multiple pump addresses
# share a single physical serial port. Keep one shared connection per
# port so we don't try to open the same port more than once.
_connections: Dict[str, "serial.Serial"] = {}


def available_ports() -> List[Dict[str, str]]:
    """
    Enumerate the serial ports available on this machine.

    Returns a list of ``{"device": ..., "description": ...}`` entries,
    cross-platform (e.g. ``COM3`` on Windows, ``/dev/cu.*`` on macOS).
    """
    ports = []
    for p in list_ports.comports():
        ports.append(
            {
                "device": p.device,
                "description": p.description or p.device,
            }
        )
    return ports


def close_other_connections(keep_port: str) -> None:
    """
    Close every shared serial connection except the one for ``keep_port``.

    Used when the user switches to a different port so we don't leave the
    previous port locked open.
    """
    for port in list(_connections.keys()):
        if port != keep_port:
            conn = _connections.pop(port)
            if conn.is_open:
                conn.close()


class NewEraPump:
    """
    Interface for a New Era syringe pump over RS-232

    Args:
        address: The pump's chain address, zero-padded to two digits (e.g. "00")
        port: The serial port device to communicate over (e.g. "COM3" or
            "/dev/cu.usbserial-1130")
    """

    def __init__(self, address: str, port: str = ""):
        self.port = port
        self.baudrate = 19200
        self.bytesize = 8
        self.parity = "N"
        self.stopbits = 1
        self.timeout = 0.2

        # Pump information. Stored here so duplicates aren't sent
        self.addr = address
        self.rate: float = 0.0

        # microL/min microL/hr
        # mL/min mL/hr
        self.rate_unit = "mL/mi"
        self.volume: float = 200.0
        self.volume_unit = "m"  # microL/mL
        self.diameter: float = 200.0
        self.diamter_unit = "mm"  # Always mm
        self.mode = "inflo"  # inflow/withdraw

        self.state = "Paused"

        # Reuse the shared connection for this port if one already exists.
        existing = _connections.get(port)
        self.ser: serial.Serial = existing if existing is not None else serial.Serial()

    def open(self):
        """
        Open the serial connection to the pump. Reuses a shared connection for
        the port if one is already open (multi-drop chain).
        """
        if not self.port:
            raise ValueError("No serial port selected")

        existing = _connections.get(self.port)
        if existing is not None and existing.is_open:
            self.ser = existing
            return

        self.ser = serial.Serial(
            self.port,
            self.baudrate,
            self.bytesize,
            self.parity,
            self.stopbits,
            self.timeout,
        )
        _connections[self.port] = self.ser

    def disconnect(self):
        """
        Disconnect the serial connection to the pump. Returns early if already disconnected
        """
        if self.ser.is_open:
            self.ser.close()
        _connections.pop(self.port, None)

    def write(self, command: str):
        """
        Write a command to the pump

        Args:
            command: The command to send without the address prefix or terminator
        """
        command = f"{self.addr}{command.strip()}\r"
        self.ser.write(command.encode())

    def read(self) -> str:
        """
        Reads bytes from the serial connection until a terminator is received

        Returns:
            The response from the pump as a string, with the terminator stripped
        """
        response = self.ser.read_until(b"\x03")

        return response.decode(errors="ignore")

    def query(self, command: str) -> str:
        """
        Writes a command to the pump and reads the response

        Args:
            command: The command to send without the address prefix or terminator

        Returns:
            The response from the pump as a string, with the terminator stripped
        """
        self.write(command)
        return self.read()

    # Allows use with 'with' statement
    def __enter__(self):
        """
        Open the interface to the pump and return the collection
        """
        self.open()
        return self

    def __exit__(self, *args):
        """
        Close the interface to the pump
        """
        self.disconnect()
