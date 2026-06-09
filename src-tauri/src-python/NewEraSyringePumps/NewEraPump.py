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

import serial


class NewEraPump:
    """
    Interface for a New Era syringe pump over RS-232

    Args:
        address: The pump's chain address, zero-padded to two digits (e.g. "00")
    """

    def __init__(self, address: str):
        self.port = "/dev/cu.usbserial-1130"
        self.baudrate = 19200
        self.bytesize = 8
        self.parity = "N"
        self.stopbits = 1
        self.timeout = 3

        # Pump information. Stored here so duplicates aren't sent
        self.addr = address
        self.rate = 0

        # microL/min microL/hr
        # mL/min mL/hr
        self.rate_unit = "mL/min"
        self.volume = 0
        self.volume_unit = "mL"  # microL/mL
        self.diameter = 20.0
        self.diamter_unit = "mm"  # Always mm
        self.mode = "inflow"  # inflow/withdraw

        self.ser: serial.Serial = serial.Serial()

    def open(self):
        """
        Open the serial connection to the pump. Return early if already open
        """
        if not self.ser.is_open:
            self.ser = serial.Serial(
                self.port,
                self.baudrate,
                self.bytesize,
                self.parity,
                self.stopbits,
                self.timeout,
            )

    def disconnect(self):
        """
        Disconnect the serial connection to the pump. Returns early if already disconnected
        """
        if self.ser.is_open:
            self.ser.close()

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
        response = b""
        while True:
            chunk = self.ser.read(1)
            if not chunk:
                break  # timeout
            response += chunk
            if response[-1:] in (b">", b"<", b":", b"T"):
                break
        return response.decode()

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
