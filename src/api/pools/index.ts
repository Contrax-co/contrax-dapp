// @ts-nocheck

import sushi from "./sushi";
import hop from "./hop";
import { FarmFunctions } from "./types";
import peapods from "./peapods";
import steer from "./steer";
import clipper from "./clipper";
import core from "./core";
import gamma from "./gamma";

// TODO: find a better way to add farms here, instead of using the farm id manually
const farmFunctions: { [key: number]: FarmFunctions } = {
    1: sushi(1), // 1: wethDai,
    2: sushi(2), // 2: wethUsdc,
    3: sushi(3), // 3: wethUsdt,
    4: sushi(4), // 4: wethWbtc,
    8: sushi(8), // 8: plsWeth,
    10: sushi(10), // 10: wethMagic,
    16: hop(16), // 16: hopEth,
    17: hop(17), // 17: hopUsdc,
    18: hop(18), // 18: hopUsdt,
    19: hop(19), // 19: hopDai,
    24: sushi(24), // 24: wethDPX,
    25: sushi(25), // 25: wethrDpx,
    26: sushi(26), // 26: wethSushi,
    27: hop(27), // 27: hoprEth,
    28: hop(28), // 28: hopMagic,
    29: peapods(29), // 29: apGmx,
    30: peapods(30), // 29: apOhm,
    31: peapods(31), // 29: apPeas,
    32: peapods(32), // 29: apPeasApOhm,
    33: peapods(33), // 33: apGMXapOHM,
    34: peapods(34), // 33: apSavvyapOHM,

    99: sushi(99), // 99: wethUSDC-deprecated
    100: sushi(100), // 100: wethUSDT-deprecated
    101: sushi(101), // 101: wethWBTC-deprecated
    102: sushi(102), // 102: wethMagic-deprecated
    103: sushi(103), // 103: wethDAI-deprecated
    104: sushi(104), // 104: wethPLS-deprecated

    35: steer(35), // 35: USDT-USDC.e
    36: steer(36), // 36: USDC-USDC.e-deprecated
    37: steer(37), // 36: WETH-USDC.e
    38: steer(38), // 36: WETH-SUSHI
    39: steer(39), // 36: USDC-USDC.e

    201: steer(201), // 201: WETH-USDCB
    202: steer(202), // 202: WETH-SNSY
    203: steer(203), // 203: WETH-cbBTC

    40: clipper(40), // 36: Clipper

    301: core(301), // 301: stCore

    401: gamma(401), // 401: wPol
};

export default farmFunctions;
