// gobang-ai.js - 合并后的五子棋 AI 代码

// ===== 配置 =====
const config = {
  enableCache: true,
  pointsLimit: 20,
  onlyInLine: false,
  inlineCount: 4,
  inLineDistance: 5,
};

// ===== 形状定义 =====
const patterns = {
  five: new RegExp('11111'),
  blockfive: new RegExp('211111|111112'),
  four: new RegExp('011110'),
  blockFour: new RegExp('10111|11011|11101|211110|211101|211011|210111|011112|101112|110112|111012'),
  three: new RegExp('011100|011010|010110|001110'),
  blockThree: new RegExp('211100|211010|210110|001112|010112|011012'),
  two: new RegExp('001100|011000|000110|010100|001010'),
};

const shapes = {
  FIVE: 5,
  BLOCK_FIVE: 50,
  FOUR: 4,
  FOUR_FOUR: 44,
  FOUR_THREE: 43,
  THREE_THREE: 33,
  BLOCK_FOUR: 40,
  THREE: 3,
  BLOCK_THREE: 30,
  TWO_TWO: 22,
  TWO: 2,
  NONE: 0,
};

const shapePerformance = {
  five: 0,
  blockFive: 0,
  four: 0,
  blockFour: 0,
  three: 0,
  blockThree: 0,
  two: 0,
  none: 0,
  total: 0,
};

// ===== 形状检测 =====
function getShape(board, x, y, offsetX, offsetY, role) {
  const opponent = -role;
  let emptyCount = 0;
  let selfCount = 1;
  let opponentCount = 0;
  let shape = shapes.NONE;

  if (board[x + offsetX + 1][y + offsetY + 1] === 0
    && board[x - offsetX + 1][y - offsetY + 1] === 0
    && board[x + 2 * offsetX + 1][y + 2 * offsetY + 1] === 0
    && board[x - 2 * offsetX + 1][y - 2 * offsetY + 1] === 0
  ) {
    return [shapes.NONE, selfCount, opponentCount, emptyCount];
  }

  for (let i = -3; i <= 3; i++) {
    if (i === 0) continue;
    const [nx, ny] = [x + i * offsetX + 1, y + i * offsetY + 1];
    if (board[nx] === undefined || board[nx][ny] === undefined) continue;
    const currentRole = board[nx][ny];
    if (currentRole === 2) {
      opponentCount++;
    } else if (currentRole === role) {
      selfCount++;
    } else if (currentRole === 0) {
      emptyCount++;
    }
  }
  if (selfCount === 2) {
    if (!opponentCount) {
      return [shapes.TWO, selfCount, opponentCount, emptyCount];
    } else {
      return [shapes.NONE, selfCount, opponentCount, emptyCount];
    }
  }

  emptyCount = 0;
  selfCount = 1;
  opponentCount = 0;
  let resultString = '1';

  for (let i = 1; i <= 5; i++) {
    const [nx, ny] = [x + i * offsetX + 1, y + i * offsetY + 1];
    const currentRole = board[nx][ny];
    if (currentRole === 2) resultString += '2';
    else if (currentRole === 0) resultString += '0';
    else resultString += currentRole === role ? '1' : '2';
    if (currentRole === 2 || currentRole === opponent) {
      opponentCount++;
      break;
    }
    if (currentRole === 0) {
      emptyCount++;
    }
    if (currentRole === role) {
      selfCount++;
    }
  }
  for (let i = 1; i <= 5; i++) {
    const [nx, ny] = [x - i * offsetX + 1, y - i * offsetY + 1];
    const currentRole = board[nx][ny];
    if (currentRole === 2) resultString = '2' + resultString;
    else if (currentRole === 0) resultString = '0' + resultString;
    else resultString = (currentRole === role ? '1' : '2') + resultString;
    if (currentRole === 2 || currentRole === opponent) {
      opponentCount++;
      break;
    }
    if (currentRole === 0) {
      emptyCount++;
    }
    if (currentRole === role) {
      selfCount++;
    }
  }
  if (patterns.five.test(resultString)) {
    shape = shapes.FIVE;
    shapePerformance.five++;
    shapePerformance.total++;
  } else if (patterns.four.test(resultString)) {
    shape = shapes.FOUR;
    shapePerformance.four++;
    shapePerformance.total++;
  } else if (patterns.blockFour.test(resultString)) {
    shape = shapes.BLOCK_FOUR;
    shapePerformance.blockFour++;
    shapePerformance.total++;
  } else if (patterns.three.test(resultString)) {
    shape = shapes.THREE;
    shapePerformance.three++;
    shapePerformance.total++;
  } else if (patterns.blockThree.test(resultString)) {
    shape = shapes.BLOCK_THREE;
    shapePerformance.blockThree++;
    shapePerformance.total++;
  } else if (patterns.two.test(resultString)) {
    shape = shapes.TWO;
    shapePerformance.two++;
    shapePerformance.total++;
  }
  if (selfCount <= 1 || resultString.length < 5) return [shape, selfCount, opponentCount, emptyCount];

  return [shape, selfCount, opponentCount, emptyCount];
}

function countShape(board, x, y, offsetX, offsetY, role) {
  const opponent = -role;
  let innerEmptyCount = 0;
  let tempEmptyCount = 0;
  let selfCount = 0;
  let totalLength = 0;
  let sideEmptyCount = 0;
  let noEmptySelfCount = 0, OneEmptySelfCount = 0;

  for (let i = 1; i <= 5; i++) {
    const [nx, ny] = [x + i * offsetX + 1, y + i * offsetY + 1];
    const currentRole = board[nx][ny];
    if (currentRole === 2 || currentRole === opponent) {
      break;
    }
    if (currentRole === role) {
      selfCount++;
      sideEmptyCount = 0;
      if (tempEmptyCount) {
        innerEmptyCount += tempEmptyCount;
        tempEmptyCount = 0;
      }
      if (innerEmptyCount === 0) {
        noEmptySelfCount++;
        OneEmptySelfCount++;
      } else if (innerEmptyCount === 1) {
        OneEmptySelfCount++;
      }
    }
    totalLength++;
    if (currentRole === 0) {
      tempEmptyCount++;
      sideEmptyCount++;
    }
    if (sideEmptyCount >= 2) {
      break;
    }
  }
  if (!innerEmptyCount) OneEmptySelfCount = 0;
  return { selfCount, totalLength, noEmptySelfCount, OneEmptySelfCount, innerEmptyCount, sideEmptyCount };
}

function getShapeFast(board, x, y, offsetX, offsetY, role) {
  if (board[x + offsetX + 1][y + offsetY + 1] === 0
    && board[x - offsetX + 1][y - offsetY + 1] === 0
    && board[x + 2 * offsetX + 1][y + 2 * offsetY + 1] === 0
    && board[x - 2 * offsetX + 1][y - 2 * offsetY + 1] === 0
  ) {
    return [shapes.NONE, 1];
  }

  let selfCount = 1;
  let totalLength = 1;
  let shape = shapes.NONE;
  let leftEmpty = 0, rightEmpty = 0;
  let noEmptySelfCount = 1, OneEmptySelfCount = 1;

  const left = countShape(board, x, y, -offsetX, -offsetY, role);
  const right = countShape(board, x, y, offsetX, offsetY, role);

  selfCount = left.selfCount + right.selfCount + 1;
  totalLength = left.totalLength + right.totalLength + 1;
  noEmptySelfCount = left.noEmptySelfCount + right.noEmptySelfCount + 1;
  OneEmptySelfCount = Math.max(left.OneEmptySelfCount + right.noEmptySelfCount, left.noEmptySelfCount + right.OneEmptySelfCount) + 1;
  rightEmpty = right.sideEmptyCount;
  leftEmpty = left.sideEmptyCount;

  if (totalLength < 5) return [shape, selfCount];

  if (noEmptySelfCount >= 5) {
    if (rightEmpty > 0 && leftEmpty > 0) {
      return [shapes.FIVE, selfCount];
    } else {
      return [shapes.BLOCK_FIVE, selfCount];
    }
  }
  if (noEmptySelfCount === 4) {
    if ((rightEmpty >= 1 || right.OneEmptySelfCount > right.noEmptySelfCount) && (leftEmpty >= 1 || left.OneEmptySelfCount > left.noEmptySelfCount)) {
      return [shapes.FOUR, selfCount];
    } else if (!(rightEmpty === 0 && leftEmpty === 0)) {
      return [shapes.BLOCK_FOUR, selfCount];
    }
  }
  if (OneEmptySelfCount === 4) {
    return [shapes.BLOCK_FOUR, selfCount];
  }
  if (noEmptySelfCount === 3) {
    if ((rightEmpty >= 2 && leftEmpty >= 1) || (rightEmpty >= 1 && leftEmpty >= 2)) {
      return [shapes.THREE, selfCount];
    } else {
      return [shapes.BLOCK_THREE, selfCount];
    }
  }
  if (OneEmptySelfCount === 3) {
    if ((rightEmpty >= 1 && leftEmpty >= 1)) {
      return [shapes.THREE, selfCount];
    } else {
      return [shapes.BLOCK_THREE, selfCount];
    }
  }
  if ((noEmptySelfCount === 2 || OneEmptySelfCount === 2) && totalLength > 5) {
    shape = shapes.TWO;
  }

  return [shape, selfCount];
}

function isFive(shape) {
  return shape === shapes.FIVE || shape === shapes.BLOCK_FIVE;
}

function isFour(shape) {
  return shape === shapes.FOUR || shape === shapes.BLOCK_FOUR;
}

function getAllShapesOfPoint(shapeCache, x, y, role) {
  const roles = role ? [role] : [1, -1];
  const result = [];
  for (const r of roles) {
    for (const d of [0, 1, 2, 3]) {
      const shape = shapeCache[r][d][x][y];
      if (shape > 0) {
        result.push(shape);
      }
    }
  }
  return result;
}

// ===== 坐标转换 =====
function position2Coordinate(position, size) {
  return [Math.floor(position / size), position % size];
}

function coordinate2Position(x, y, size) {
  return x * size + y;
}

function isLine(a, b, size) {
  const maxDistance = config.inLineDistance;
  const [x1, y1] = position2Coordinate(a, size);
  const [x2, y2] = position2Coordinate(b, size);
  return (
    (x1 === x2 && Math.abs(y1 - y2) < maxDistance) ||
    (y1 === y2 && Math.abs(x1 - x2) < maxDistance) ||
    (Math.abs(x1 - x2) === Math.abs(y1 - y2) && Math.abs(x1 - x2) < maxDistance)
  );
}

function isAllInLine(p, arr, size) {
  for (let i = 0; i < arr.length; i++) {
    if (!isLine(p, arr[i], size)) {
      return false;
    }
  }
  return true;
}

function hasInLine(p, arr, size) {
  for (let i = 0; i < arr.length; i++) {
    if (isLine(p, arr[i], size)) {
      return true;
    }
  }
  return false;
}

// ===== Zobrist 哈希 =====
class ZobristCache {
  constructor(size) {
    this.size = size;
    this.zobristTable = this.initializeZobristTable(size);
    this.hash = 0n;
  }

  initializeZobristTable(size) {
    let table = [];
    for (let i = 0; i < size; i++) {
      table[i] = [];
      for (let j = 0; j < size; j++) {
        table[i][j] = {
          "1": BigInt(this.randomBitString(64)),
          "-1": BigInt(this.randomBitString(64))
        };
      }
    }
    return table;
  }

  randomBitString(length) {
    let str = "0b";
    for (let i = 0; i < length; i++) {
      str += Math.round(Math.random()).toString();
    }
    return str;
  }

  togglePiece(x, y, role) {
    this.hash ^= this.zobristTable[x][y][role];
  }

  getHash() {
    return this.hash;
  }
}

// ===== 缓存 =====
class Cache {
  constructor(capacity = 1000000) {
    this.capacity = capacity;
    this.cache = [];
    this.map = new Map();
  }

  get(key) {
    if (!config.enableCache) return false;
    if (this.map.has(key)) {
      return this.map.get(key);
    }
    return null;
  }

  put(key, value) {
    if (!config.enableCache) return false;
    if (this.cache.length >= this.capacity) {
      const oldestKey = this.cache.shift();
      this.map.delete(oldestKey);
    }
    if (!this.map.has(key)) {
      this.cache.push(key);
    }
    this.map.set(key, value);
  }

  has(key) {
    if (!config.enableCache) return false;
    return this.map.has(key);
  }
}

// ===== 评分系统 =====
const FIVE = 10000000;
const BLOCK_FIVE = FIVE;
const FOUR = 100000;
const FOUR_FOUR = FOUR;
const FOUR_THREE = FOUR;
const THREE_THREE = FOUR / 2;
const BLOCK_FOUR = 1500;
const THREE = 1000;
const BLOCK_THREE = 150;
const TWO_TWO = 200;
const TWO = 100;
const BLOCK_TWO = 15;
const ONE = 10;
const BLOCK_ONE = 1;

function getRealShapeScore(shape) {
  switch (shape) {
    case shapes.FIVE:
      return FOUR;
    case shapes.BLOCK_FIVE:
      return BLOCK_FOUR;
    case shapes.FOUR:
      return THREE;
    case shapes.FOUR_FOUR:
      return THREE;
    case shapes.FOUR_THREE:
      return THREE;
    case shapes.BLOCK_FOUR:
      return BLOCK_THREE;
    case shapes.THREE:
      return TWO;
    case shapes.THREE_THREE:
      return THREE_THREE / 10;
    case shapes.BLOCK_THREE:
      return BLOCK_TWO;
    case shapes.TWO:
      return ONE;
    case shapes.TWO_TWO:
      return TWO_TWO / 10;
    default:
      return 0;
  }
}

const allDirections = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1]
];

function direction2index(ox, oy) {
  if (ox === 0) return 0;
  if (oy === 0) return 1;
  if (ox === oy) return 2;
  if (ox !== oy) return 3;
}

const evalPerformance = {
  updateTime: 0,
  getPointsTime: 0,
};

class Evaluate {
  constructor(size = 15) {
    this.size = size;
    this.board = Array.from({ length: size + 2 }).map((_, i) =>
      Array.from({ length: size + 2 }).map((_, j) =>
        (i === 0 || j === 0 || i === size + 1 || j === size + 1) ? 2 : 0
      )
    );
    this.blackScores = Array.from({ length: size }).map(() => Array.from({ length: size }).fill(0));
    this.whiteScores = Array.from({ length: size }).map(() => Array.from({ length: size }).fill(0));
    this.initPoints();
    this.history = [];
  }

  move(x, y, role) {
    for (const d of [0, 1, 2, 3]) {
      this.shapeCache[role][d][x][y] = 0;
      this.shapeCache[-role][d][x][y] = 0;
    }
    this.blackScores[x][y] = 0;
    this.whiteScores[x][y] = 0;
    this.board[x + 1][y + 1] = role;
    this.updatePoint(x, y);
    this.history.push([coordinate2Position(x, y, this.size), role]);
  }

  undo(x, y) {
    this.board[x + 1][y + 1] = 0;
    this.updatePoint(x, y);
    this.history.pop();
  }

  initPoints() {
    this.shapeCache = {};
    for (let role of [1, -1]) {
      this.shapeCache[role] = {};
      for (let direction of [0, 1, 2, 3]) {
        this.shapeCache[role][direction] = Array.from({ length: this.size }).map(() => Array.from({ length: this.size }).fill(shapes.NONE));
      }
    }
    this.pointsCache = {}
    for (let role of [1, -1]) {
      this.pointsCache[role] = {};
      for (let key of Object.keys(shapes)) {
        const shape = shapes[key];
        this.pointsCache[role][shape] = new Set();
      }
    }
  }

  getPointsInLine(role) {
    let pointsInLine = {};
    let hasPointsInLine = false;
    Object.keys(shapes).forEach((key) => {
      pointsInLine[shapes[key]] = new Set();
    });
    let last2Points = this.history.slice(-config.inlineCount).map(([position, role]) => position);
    const processed = {};
    for (let r of [role, -role]) {
      for (let point of last2Points) {
        const [x, y] = position2Coordinate(point, this.size);
        for (let [ox, oy] of allDirections) {
          for (let sign of [1, -1]) {
            for (let step = 1; step <= config.inLineDistance; step++) {
              const [nx, ny] = [x + sign * step * ox, y + sign * step * oy];
              const position = coordinate2Position(nx, ny, this.size);
              if (nx < 0 || nx >= this.size || ny < 0 || ny >= this.size) {
                break;
              }
              if (this.board[nx + 1][ny + 1] !== 0) {
                continue;
              }
              if (processed[position] === r) continue;
              processed[position] = r;
              for (let direction of [0, 1, 2, 3]) {
                const shape = this.shapeCache[r][direction][nx][ny];
                if (shape) {
                  pointsInLine[shape].add(coordinate2Position(nx, ny, this.size));
                  hasPointsInLine = true;
                }
              }
            }
          }
        }
      }
    }
    if (hasPointsInLine) {
      return pointsInLine;
    }
    return false;
  }

  getPoints(role, depth, vct, vcf) {
    const first = depth % 2 === 0 ? role : -role;
    const start = new Date();
    if (config.onlyInLine && this.history.length >= config.inlineCount) {
      const pointsInLine = this.getPointsInLine(role);
      if (pointsInLine) {
        evalPerformance.getPointsTime += new Date() - start;
        return pointsInLine;
      }
    }

    let points = {};
    Object.keys(shapes).forEach((key) => {
      points[shapes[key]] = new Set();
    });

    const lastPoints = this.history.slice(-4).map(([position, role]) => position);

    for (let r of [role, -role]) {
      for (let i = 0; i < this.size; i++) {
        for (let j = 0; j < this.size; j++) {
          let fourCount = 0, blockFourCount = 0, threeCount = 0;
          for (let direction of [0, 1, 2, 3]) {
            if (this.board[i + 1][j + 1] !== 0) continue;
            const shape = this.shapeCache[r][direction][i][j];
            if (!shape) continue;
            if (vcf) {
              if (r === first && !isFour(shape) && !isFive(shape)) continue;
              if (r === -first && isFive(shape)) continue
            }
            const point = i * this.size + j;
            if (vct) {
              if (depth % 2 === 0) {
                if (depth === 0 && r !== first) continue;
                if (shape !== shapes.THREE && !isFour(shape) && !isFive(shape)) continue;
                if (shape === shapes.THREE && r !== first) continue;
                if (depth === 0 && r !== first) continue;
                if (depth > 0) {
                  if (shape === shapes.THREE && getAllShapesOfPoint(this.shapeCache, i, j, r).length === 1) continue;
                  if (shape === shapes.BLOCK_FOUR && getAllShapesOfPoint(this.shapeCache, i, j, r).length === 1) continue;
                }
              } else {
                if (shape !== shapes.THREE && !isFour(shape) && !isFive(shape)) continue;
                if (shape === shapes.THREE && r === -first) continue;
                if (depth > 1) {
                  if (shape === shapes.BLOCK_FOUR && getAllShapesOfPoint(this.shapeCache, i, j).length === 1) continue;
                  if (shape === shapes.BLOCK_FOUR && !hasInLine(point, lastPoints, this.size)) continue;
                }
              }
            }
            if (vcf) {
              if (!isFour(shape) && !isFive(shape)) continue;
            }
            if (depth > 2 && (shape === shapes.TWO || shape === shapes.TWO_TWO || shape === shapes.BLOCK_THREE) && !hasInLine(point, lastPoints, this.size)) continue;
            points[shape].add(point);
            if (shape === shapes.FOUR) fourCount++;
            else if (shape === shapes.BLOCK_FOUR) blockFourCount++;
            else if (shape === shapes.THREE) threeCount++;
            let unionShape = undefined;
            if (fourCount >= 2) {
              unionShape = shapes.FOUR_FOUR;
            } else if (blockFourCount && threeCount) {
              unionShape = shapes.FOUR_THREE;
            } else if (threeCount >= 2) {
              unionShape = shapes.THREE_THREE;
            }
            if (unionShape) {
              points[unionShape].add(point);
            }
          }
        }
      }
    }

    evalPerformance.getPointsTime += new Date() - start;
    return points;
  }

  updatePoint(x, y) {
    const start = new Date();
    this.updateSinglePoint(x, y, 1);
    this.updateSinglePoint(x, y, -1);

    for (let [ox, oy] of allDirections) {
      for (let sign of [1, -1]) {
        for (let step = 1; step <= 5; step++) {
          let reachEdge = false;
          for (let role of [1, -1]) {
            const [nx, ny] = [x + sign * step * ox + 1, y + sign * step * oy + 1];
            if (this.board[nx][ny] === 2) {
              reachEdge = true;
              break;
            } else if (this.board[nx][ny] === -role) {
              continue;
            } else if (this.board[nx][ny] === 0) {
              this.updateSinglePoint(nx - 1, ny - 1, role, [sign * ox, sign * oy]);
            }
          }
          if (reachEdge) break;
        }
      }
    }
    evalPerformance.updateTime += new Date() - start;
  }

  updateSinglePoint(x, y, role, direction = undefined) {
    if (this.board[x + 1][y + 1] !== 0) return;

    this.board[x + 1][y + 1] = role;
    let directions = []
    if (direction) {
      directions.push(direction);
    } else {
      directions = allDirections;
    }
    const shapeCache = this.shapeCache[role];
    for (let [ox, oy] of directions) {
      shapeCache[direction2index(ox, oy)][x][y] = shapes.NONE;
    }

    let score = 0;
    let blockfourCount = 0;
    let threeCount = 0;
    let twoCount = 0;
    for (let intDirection of [0, 1, 2, 3]) {
      const shape = shapeCache[intDirection][x][y];
      if (shape > shapes.NONE) {
        score += getRealShapeScore(shape);
        if (shape === shapes.BLOCK_FOUR) blockfourCount++;
        if (shape === shapes.THREE) threeCount++;
        if (shape === shapes.TWO) twoCount++;
      }
    }
    for (let [ox, oy] of directions) {
      const intDirection = direction2index(ox, oy);
      let [shape, selfCount] = getShapeFast(this.board, x, y, ox, oy, role);
      if (!shape) continue;
      if (shape) {
        shapeCache[intDirection][x][y] = shape;
        if (shape === shapes.BLOCK_FOUR) blockfourCount++;
        if (shape === shapes.THREE) threeCount++;
        if (shape === shapes.TWO) twoCount++;
        if (blockfourCount >= 2) {
          shape = shapes.FOUR_FOUR;
        } else if (blockfourCount && threeCount) {
          shape = shapes.FOUR_THREE;
        } else if (threeCount >= 2) {
          shape = shapes.THREE_THREE;
        } else if (twoCount >= 2) {
          shape = shapes.TWO_TWO;
        }
        score += getRealShapeScore(shape);
      }
    }

    this.board[x + 1][y + 1] = 0;
    if (role === 1) {
      this.blackScores[x][y] = score;
    } else {
      this.whiteScores[x][y] = score;
    }

    return score;
  }

  evaluate(role) {
    let blackScore = 0;
    let whiteScore = 0;
    for (let i = 0; i < this.blackScores.length; i++) {
      for (let j = 0; j < this.blackScores[i].length; j++) {
        blackScore += this.blackScores[i][j];
      }
    }
    for (let i = 0; i < this.whiteScores.length; i++) {
      for (let j = 0; j < this.whiteScores[i].length; j++) {
        whiteScore += this.whiteScores[i][j];
      }
    }
    const score = role == 1 ? blackScore - whiteScore : whiteScore - blackScore;
    return score;
  }

  getMoves(role, depth, onThree = false, onlyFour = false) {
    const moves = Array.from(this._getMoves(role, depth, onThree, onlyFour)).map((move) => [Math.floor(move / this.size), move % this.size]);
    return moves;
  }

  _getMoves(role, depth, onlyThree = false, onlyFour = false) {
    const points = this.getPoints(role, depth, onlyThree, onlyFour);
    const fives = points[shapes.FIVE];
    const blockFives = points[shapes.BLOCK_FIVE];
    if (fives?.size || blockFives?.size) return new Set([...fives, ...blockFives]);
    const fours = points[shapes.FOUR];
    const blockfours = points[shapes.BLOCK_FOUR];
    if (onlyFour || fours?.size) {
      return new Set([...fours, ...blockfours]);
    }
    const four_fours = points[shapes.FOUR_FOUR];
    if (four_fours.size) return new Set([...four_fours, ...blockfours]);
    const threes = points[shapes.THREE];
    const four_threes = points[shapes.FOUR_THREE];
    if (four_threes?.size) return new Set([...four_threes, ...blockfours, ...threes]);
    const three_threes = points[shapes.THREE_THREE];
    if (three_threes?.size) return new Set([...three_threes, ...blockfours, ...threes]);

    if (onlyThree) return new Set([...blockfours, ...threes]);

    const blockthrees = points[shapes.BLOCK_THREE];
    const two_twos = points[shapes.TWO_TWO];
    const twos = points[shapes.TWO];
    const res = new Set([...blockfours, ...threes, ...blockthrees, ...two_twos, ...twos].slice(0, config.pointsLimit));
    return res;
  }

  display() {
    let result = '';
    for (let i = 1; i < this.size + 1; i++) {
      for (let j = 1; j < this.size + 1; j++) {
        switch (this.board[i][j]) {
          case 1:
            result += 'O ';
            break;
          case -1:
            result += 'X ';
            break;
          default:
            result += '- ';
            break;
        }
      }
      result += '\n';
    }
    console.log(result);
  }
}

// ===== 棋盘类 =====
class Board {
  constructor(size = 15, firstRole = 1) {
    this.size = size;
    this.board = Array(size).fill().map(() => Array(size).fill(0));
    this.firstRole = firstRole;
    this.role = firstRole;
    this.history = [];
    this.zobrist = new ZobristCache(size);
    this.winnerCache = new Cache();
    this.gameoverCache = new Cache();
    this.evaluateCache = new Cache();
    this.valuableMovesCache = new Cache();
    this.evaluateTime = 0;
    this.evaluator = new Evaluate(size);
  }

  isGameOver() {
    const hash = this.hash();
    if (this.gameoverCache.get(hash)) {
      return this.gameoverCache.get(hash);
    }
    if (this.getWinner() !== 0) {
      this.gameoverCache.put(hash, true);
      return true;
    }
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.board[i][j] === 0) {
          this.gameoverCache.put(hash, false);
          return false;
        }
      }
    }
    this.gameoverCache.put(hash, true);
    return true;
  }

  getWinner() {
    const hash = this.hash();
    if (this.winnerCache.get(hash)) {
      return this.winnerCache.get(hash);
    }
    let directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.board[i][j] === 0) continue;
        for (let direction of directions) {
          let count = 0;
          while (
            i + direction[0] * count >= 0 &&
            i + direction[0] * count < this.size &&
            j + direction[1] * count >= 0 &&
            j + direction[1] * count < this.size &&
            this.board[i + direction[0] * count][j + direction[1] * count] === this.board[i][j]
          ) {
            count++;
          }
          if (count >= 5) {
            this.winnerCache.put(hash, this.board[i][j]);
            return this.board[i][j];
          }
        }
      }
    }
    this.winnerCache.put(hash, 0);
    return 0;
  }

  getValidMoves() {
    let moves = [];
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.board[i][j] === 0) {
          moves.push([i, j]);
        }
      }
    }
    return moves;
  }

  put(x, y, role) {
    if (role === undefined) {
      role = this.role;
    }
    if (isNaN(x) || isNaN(y)) {
      console.log("Invalid move Not Number!", x, y);
      return false;
    }
    if (this.board[x][y] !== 0) {
      console.log("Invalid move!", x, y);
      return false;
    }
    this.board[x][y] = role;
    this.history.push({ x, y, role });
    this.zobrist.togglePiece(x, y, role);
    this.evaluator.move(x, y, role);
    this.role *= -1;
    return true;
  }

  undo() {
    if (this.history.length === 0) {
      console.log("No moves to undo!");
      return false;
    }
    let lastMove = this.history.pop();
    this.board[lastMove.x][lastMove.y] = 0;
    this.role = lastMove.role;
    this.zobrist.togglePiece(lastMove.x, lastMove.y, lastMove.role);
    this.evaluator.undo(lastMove.x, lastMove.y);
    return true;
  }

  position2coordinate(position) {
    const row = Math.floor(position / this.size)
    const col = position % this.size
    return [row, col]
  }

  coordinate2position(coordinate) {
    return coordinate[0] * this.size + coordinate[1]
  }

  getValuableMoves(role, depth = 0, onlyThree = false, onlyFour = false) {
    const hash = this.hash();
    const prev = this.valuableMovesCache.get(hash);
    if (prev) {
      if (prev.role === role && prev.depth === depth && prev.onlyThree === onlyThree && prev.onlyFour === onlyFour) {
        return prev.moves;
      }
    }
    const moves = this.evaluator.getMoves(role, depth, onlyThree, onlyFour);
    if (!onlyThree && !onlyFour) {
      const center = Math.floor(this.size / 2);
      if (this.board[center][center] == 0) moves.push([center, center]);
    }
    this.valuableMovesCache.put(hash, {
      role,
      moves,
      depth,
      onlyThree,
      onlyFour
    });
    return moves;
  }

  display(extraPoints = []) {
    const extraPosition = extraPoints.map((point) => this.coordinate2position(point));
    let result = '';
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const position = this.coordinate2position([i, j]);
        if (extraPosition.includes(position)) {
          result += '? ';
          continue;
        }
        switch (this.board[i][j]) {
          case 1:
            result += 'O ';
            break;
          case -1:
            result += 'X ';
            break;
          default:
            result += '- ';
            break;
        }
      }
      result += '\n';
    }
    return result;
  }

  hash() {
    return this.zobrist.getHash();
  }

  evaluate(role) {
    const hash = this.hash();
    const prev = this.evaluateCache.get(hash);
    if (prev) {
      if (prev.role === role) {
        return prev.score;
      }
    }
    const winner = this.getWinner();
    let score = 0;
    if (winner !== 0) {
      score = FIVE * winner * role;
    } else {
      score = this.evaluator.evaluate(role);
    }
    this.evaluateCache.put(hash, { role, score });
    return score;
  }

  reverse() {
    const newBoard = new Board(this.size, -this.firstRole);
    for (let i = 0; i < this.history.length; i++) {
      const { x, y, role } = this.history[i];
      newBoard.put(x, y, -role);
    }
    return newBoard;
  }

  toString() {
    return this.board.map(row => row.join('')).join('');
  }

  toJSON() {
    return {
      size: this.size,
      board: this.board,
      firstRole: this.firstRole,
      role: this.role,
      history: this.history
    };
  }

  static fromJSON(data) {
    const board = new Board(data.size, data.firstRole);
    board.board = data.board;
    board.role = data.role;
    board.history = data.history;
    board.zobrist = new ZobristCache(data.size);
    board.evaluator = new Evaluate(data.size);
    for (const move of data.history) {
      board.zobrist.togglePiece(move.x, move.y, move.role);
      board.evaluator.move(move.x, move.y, move.role);
    }
    return board;
  }
}

// ===== 极小极大搜索 =====
const MAX = 1000000000;
const cache_hits = {
  search: 0,
  total: 0,
  hit: 0,
};

const onlyThreeThreshold = 6;
const cache = new Cache();

let progressCallback = null;
let totalNodes = 0;
let currentPhase = 0;
let totalPhases = 0;

function setProgressCallback(callback) {
  progressCallback = callback;
}

function reportProgress(phase, current, total) {
  if (progressCallback) {
    progressCallback({
      phase: phase,
      current: current,
      total: total,
      nodes: cache_hits.search,
      cacheHits: cache_hits.hit,
      cacheTotal: cache_hits.total
    });
  }
}

function factory(onlyThree = false, onlyFour = false) {
  function helper(board, role, depth, cDepth = 0, path = [], alpha = -MAX, beta = MAX) {
    cache_hits.search++;
    
    if (cDepth === 0 && progressCallback) {
      totalNodes++;
      if (totalNodes % 100 === 0) {
        reportProgress(currentPhase, totalNodes, totalPhases);
      }
    }
    
    if (cDepth >= depth || board.isGameOver()) {
      return [board.evaluate(role), null, [...path]];
    }
    const hash = board.hash();
    const prev = cache.get(hash);
    if (prev && prev.role === role) {
      if ((Math.abs(prev.value) >= FIVE || prev.depth >= depth - cDepth) && prev.onlyThree === onlyThree && prev.onlyFour === onlyFour) {
        cache_hits.hit++;
        return [prev.value, prev.move, [...path, ...prev.path]];
      }
    }
    let value = -MAX;
    let move = null;
    let bestPath = [...path];
    let bestDepth = 0;
    let points = board.getValuableMoves(role, cDepth, onlyThree || cDepth > onlyThreeThreshold, onlyFour);
    if (cDepth === 0) {
      console.log('points:', points);
    }
    if (!points.length) {
      return [board.evaluate(role), null, [...path]];
    }
    for (let d = cDepth + 1; d <= depth; d += 1) {
      if (d % 2 !== 0) continue;
      let breakAll = false;
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        board.put(point[0], point[1], role);
        let newPath = [...path, point];
        let [currentValue, currentMove, currentPath] = helper(board, -role, d, cDepth + 1, newPath, -beta, -alpha);
        currentValue = -currentValue;
        board.undo();
        if (currentValue >= FIVE || d === depth) {
          if ((currentValue > value) ||
            (currentValue <= -FIVE && value <= -FIVE && currentPath.length > bestDepth)) {
            value = currentValue;
            move = point;
            bestPath = currentPath;
            bestDepth = currentPath.length;
          }
        }
        alpha = Math.max(alpha, value);
        if (alpha >= FIVE) {
          breakAll = true;
          break;
        }
        if (alpha >= beta) {
          break;
        }
      }
      if (breakAll) {
        break;
      }
    }
    if ((cDepth < onlyThreeThreshold || onlyThree || onlyFour) && (!prev || prev.depth < depth - cDepth)) {
      cache_hits.total += 1;
      cache.put(hash, {
        depth: depth - cDepth,
        value,
        move,
        role,
        path: bestPath.slice(cDepth),
        onlyThree,
        onlyFour,
      });
    }
    const res = [value, move, bestPath];
    return res;
  }
  return helper;
}

const _minmax = factory();
const vct = factory(true);
const vcf = factory(false, true);

function minmax(board, role, depth = 4, enableVCT = true) {
  totalNodes = 0;
  totalPhases = enableVCT ? 4 : 1;
  
  if (enableVCT) {
    currentPhase = 1;
    reportProgress(1, 0, 100);
    const vctDepth = depth + 8;
    let [value, move, bestPath] = vct(board, role, vctDepth);
    if (value >= FIVE) {
      reportProgress(4, 100, 100);
      return [value, move, bestPath];
    }
    
    currentPhase = 2;
    totalNodes = 0;
    reportProgress(2, 0, 100);
    [value, move, bestPath] = _minmax(board, role, depth);
    
    currentPhase = 3;
    totalNodes = 0;
    reportProgress(3, 0, 100);
    board.put(move[0], move[1], role);
    let [value2, move2, bestPath2] = vct(board.reverse(), role, vctDepth)
    board.undo();
    if (value < FIVE && value2 === FIVE && bestPath2.length > bestPath.length) {
      let [value3, move3, bestPath3] = vct(board.reverse(), role, vctDepth)
      if (bestPath2.length <= bestPath3.length) {
        reportProgress(4, 100, 100);
        return [value, move2, bestPath2];
      }
    }
    reportProgress(4, 100, 100);
    return [value, move, bestPath];
  } else {
    reportProgress(1, 0, 100);
    const result = _minmax(board, role, depth);
    reportProgress(1, 100, 100);
    return result;
  }
}

// ===== 游戏状态管理 =====
const board_size = 15;

const STATUS = {
  IDLE: 'idle',
  GAMING: 'gaming',
};

let gameBoard = null;
let gameState = {
  status: STATUS.IDLE,
  currentPlayer: 1,
  winner: null,
  history: [],
  aiFirst: true,
  depth: 4,
  showIndex: false,
  debug: false,
  score: 0,
  path: [],
  loading: false,
  aiVsAi: false,
  aiVsAiInterval: null,
};

function startGame() {
  gameBoard = new Board(board_size, 1);
  gameState.status = STATUS.GAMING;
  gameState.currentPlayer = 1;
  gameState.winner = null;
  gameState.history = [];
  gameState.score = 0;
  gameState.path = [];
  gameState.aiVsAi = false;

  if (gameState.aiFirst) {
    gameState.loading = true;
    renderBoard();
    if (typeof startProgress !== 'undefined') startProgress();
    setTimeout(() => {
      const aiMove = getAIMove();
      if (aiMove) {
        applyMove(aiMove[0], aiMove[1]);
      }
      gameState.loading = false;
      if (typeof stopProgress !== 'undefined') stopProgress();
      renderBoard();
    }, 50);
  }
  renderBoard();
}

function startAiVsAi() {
  gameBoard = new Board(board_size, 1);
  gameState.status = STATUS.GAMING;
  gameState.currentPlayer = 1;
  gameState.winner = null;
  gameState.history = [];
  gameState.score = 0;
  gameState.path = [];
  gameState.aiVsAi = true;
  renderBoard();
  
  const doAiMove = () => {
    if (gameState.winner || gameState.status !== STATUS.GAMING) {
      stopAiVsAi();
      return;
    }
    
    gameState.loading = true;
    renderBoard();
    if (typeof startProgress !== 'undefined') startProgress();
    
    setTimeout(() => {
      const aiMove = getAIMove();
      if (aiMove) {
        applyMove(aiMove[0], aiMove[1]);
      }
      gameState.loading = false;
      if (typeof stopProgress !== 'undefined') stopProgress();
      renderBoard();
      
      if (gameState.winner || gameState.status !== STATUS.GAMING) {
        stopAiVsAi();
      }
    }, 100);
  };
  
  doAiMove();
  gameState.aiVsAiInterval = setInterval(doAiMove, 500);
}

function stopAiVsAi() {
  if (gameState.aiVsAiInterval) {
    clearInterval(gameState.aiVsAiInterval);
    gameState.aiVsAiInterval = null;
  }
  gameState.aiVsAi = false;
  gameState.loading = false;
  if (!gameState.winner) {
    gameState.status = STATUS.IDLE;
  }
  renderBoard();
}

function getAIMove() {
  const [score, move, path] = minmax(gameBoard, gameBoard.role, gameState.depth, true);
  gameState.score = score;
  gameState.path = path;
  return move;
}

function applyMove(x, y) {
  gameBoard.put(x, y);
  gameState.history.push({ x, y, role: -gameBoard.role });
  gameState.currentPlayer = gameBoard.role;
  checkWinner();
}

function playerMove(x, y) {
  if (gameState.aiVsAi) return;
  if (gameState.status !== STATUS.GAMING || gameState.loading) return;
  if (gameBoard.board[x][y] !== 0) return;
  applyMove(x, y);
  renderBoard();

  if (!gameState.winner && gameState.status === STATUS.GAMING) {
    gameState.loading = true;
    renderBoard();
    if (typeof startProgress !== 'undefined') startProgress();
    setTimeout(() => {
      const aiMove = getAIMove();
      if (aiMove) {
        applyMove(aiMove[0], aiMove[1]);
      }
      gameState.loading = false;
      if (typeof stopProgress !== 'undefined') stopProgress();
      renderBoard();
    }, 50);
  }
}

function undoMove() {
  if (gameState.aiVsAi) return;
  if (gameState.status !== STATUS.GAMING || gameState.history.length < 2) return;
  gameBoard.undo();
  gameBoard.undo();
  gameState.history.pop();
  gameState.history.pop();
  gameState.currentPlayer = gameBoard.role;
  gameState.winner = null;
  renderBoard();
}

function endGame() {
  if (gameState.aiVsAi) return;
  gameState.status = STATUS.IDLE;
  renderBoard();
}

function checkWinner() {
  const winner = gameBoard.getWinner();
  if (winner !== 0) {
    gameState.winner = winner;
    gameState.status = STATUS.IDLE;
  }
}

function setAiFirst(checked) {
  gameState.aiFirst = checked;
}

function setDepth(value) {
  gameState.depth = Number(value);
}

function setShowIndex(checked) {
  gameState.showIndex = checked;
  renderBoard();
}

function setDebug(checked) {
  gameState.debug = checked;
  renderBoard();
}

// 导出供 Worker 使用
if (typeof self !== 'undefined' && typeof importScripts !== 'function') {
  self.Board = Board;
  self.minmax = minmax;
  self.setProgressCallback = setProgressCallback;
  self.cache_hits = cache_hits;
  self.shapePerformance = shapePerformance;
  self.FIVE = FIVE;
}
