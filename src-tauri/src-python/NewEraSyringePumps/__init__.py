import sys
from typing import Dict, Optional

from anyio.from_thread import start_blocking_portal
from pydantic import BaseModel
from pytauri import (
    Commands,
    builder_factory,
    context_factory,
)

from .NewEraPump import NewEraPump

commands: Commands = Commands()

# Global state to hold our active serial connection
active_pumps: Dict[str, NewEraPump] = {}


# --- Pydantic Models ---
class ConnectPayload(BaseModel):
    address: str


class TargetPayload(BaseModel):
    address: str


class RatePayload(BaseModel):
    address: str
    rate: float
    units: str


class VolumePayload(BaseModel):
    address: str
    volume: float
    units: str


class DiameterPayload(BaseModel):
    address: str
    diameter: float


class ModePayload(BaseModel):
    address: str
    mode: str


class ConfigPayload(BaseModel):
    address: str
    volume: float
    volume_unit: str
    rate: float
    rate_unit: str
    diameter: float
    diameter_unit: str
    mode: str


# Helper functions
def convertUnits(units: str):
    normal_units = {
        "mL": "MM",
        "microL": "UL",
    }

    timed_units = {"mL/hr": "MH", "ml/min": "MM", "microL/hr": "UH", "microL/min": "UM"}

    if units in normal_units:
        return normal_units[units]
    elif units in timed_units:
        return timed_units
    else:
        return "BAD"


# Our commands
@commands.command()
async def connect_pump(body: ConnectPayload) -> str:
    """
    Connects to the pump using the provided address.
    """
    global active_pumps

    # CORRECTED: Use 'in' to check if the key exists before accessing it
    if body.address in active_pumps:
        active_pumps[body.address].disconnect()

    active_pumps[body.address] = NewEraPump(body.address)
    active_pumps[body.address].open()

    # Send a blank query (carriage return only) to fetch the pump's basic status/prompt
    status_response = active_pumps[body.address].query("")

    return f"Successfully connected to pump '{body.address}'. Status: {status_response}"


@commands.command()
async def run_pump(body: TargetPayload) -> str:
    """
    Commands the pump to start pumping.
    """
    global active_pumps

    # CORRECTED: Use .get() which returns None if the key doesn't exist
    pump = active_pumps.get(body.address)
    if not pump or not pump.ser.is_open:
        return f"Error: Pump {body.address} is not connected. Please connect first."

    try:
        response = pump.query("RUN")
        return f"Run command executed. Response: {response}"
    except Exception as e:
        return f"Error executing run command: {str(e)}"


@commands.command()
async def stop_pump(body: TargetPayload) -> str:
    """
    Commands the pump to stop.
    """
    global active_pumps

    pump = active_pumps.get(body.address)
    if not pump:
        return f"Error: Pump {body.address} is not connected."

    # CORRECTED: Updated reference to 'pump' instead of old 'active_pump'
    response = pump.query("STP")
    return f"Pump stopped. Response: {response}"


@commands.command()
async def set_rate(body: RatePayload) -> str:
    """
    Sets the pumping rate.
    New Era rate command format: 'RAT [rate] [units]' (e.g., 'RAT 5.0 UM')
    """
    global active_pumps

    pump = active_pumps.get(body.address)
    if not pump:
        return f"Error: Pump {body.address} is not connected."

    units = convertUnits(body.units)

    if units == "BAD":
        return "Rate set failed"

    # CORRECTED: Updated reference to 'pump' instead of old 'active_pump'
    command = f"RAT {body.rate} {units}"
    response = pump.query(command)
    return f"Rate set. Response: {response}"


@commands.command()
async def set_volume(body: VolumePayload) -> str:
    """
    Sets the target volume to dispense.
    New Era volume command format: 'VOL [volume]' (and 'VOL [units]' to set units).
    """
    global active_pumps

    pump = active_pumps.get(body.address)
    if not pump:
        return f"Error: Pump {body.address} is not connected."

    units = convertUnits(body.units)

    if units == "BAD":
        return "Rate set failed"

    # Set the volume units
    command = f"VOL {body.units}"
    response1 = pump.query(command)

    # Set the volume amount
    command = f"VOL {body.volume}"
    response2 = pump.query(command)
    return f"Volume set. Response: {response1} {response2}"


@commands.command()
async def set_mode(body: ModePayload) -> str:
    """
    Sets the pump mode.
    """
    global active_pumps

    pump = active_pumps.get(body.address)
    if not pump:
        return f"Error: Pump {body.address} is not connected."

    modes = {"inflow": "INF", "withdraw": "WDR"}

    if body.mode not in modes:
        return "Mode invalid"

    command = f"MODE {modes[body.mode]}"
    response = pump.query(command)
    return f"Mode set. Response: {response}"


@commands.command()
async def set_diameter(body: DiameterPayload) -> str:
    """
    Sets the diameter of the syringe
    """
    global active_pumps

    pump = active_pumps.get(body.address)
    if not pump:
        return f"Error: Pump {body.address} is not connected."

    command = f"MODE {body.diameter}"
    response = pump.query(command)
    return f"Mode set. Response: {response}"


# The main function to run the Tauri app
def main() -> int:
    with start_blocking_portal("asyncio") as portal:  # or `trio`
        app = builder_factory().build(
            context=context_factory(),
            invoke_handler=commands.generate_handler(portal),
        )
        exit_code = app.run_return()
        return exit_code
