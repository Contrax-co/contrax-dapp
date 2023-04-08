// @ts-nocheck

import sushi from "./sushi";
import hop from "./hop";
import * as gmx from "./gmx";
import { FarmFunctions } from "./types";

// TODO: find a better way to add farms here, instead of using the farm id manually
const farmFunctions: { [key: number]: FarmFunctions } = {
    1: sushi(1), // 1: wethDai,
    2: sushi(2), // 2: wethUsdc,
    3: sushi(3), // 3: wethUsdt,
    4: sushi(4), // 4: wethWbtc,
    5: gmx, // 5: gmx,
    8: sushi(8), // 8: plsWeth,
    10: sushi(10), // 10: wethMagic,
    16: hop(16), // 16: hopEth,
    17: hop(17), // 17: hopUsdc,
    18: hop(18), // 18: hopUsdt,
    19: hop(19), // 19: hopDai,
    24: sushi(24), // 24: wethDPX,
    25: sushi(25), // 25: wethrDpx,
    26: sushi(26), // 25: wethSushi,

    99: sushi(99), // 10: wethUSDC-deprecated
    100: sushi(100), // 10: wethUSDT-deprecated
    101: sushi(101), // 10: wethWBTC-deprecated
    102: sushi(102), // 10: wethMagic-deprecated
    103: sushi(103), // 10: wethDAI-deprecated
    104: sushi(104), // 10: wethPLS-deprecated
};

export default farmFunctions;
