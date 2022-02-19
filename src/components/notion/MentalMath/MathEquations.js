import React from "react";
import styled from "styled-components";

const Row = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  flex-wrap: wrap;
`;

const Column = styled.div`
  width: 33.33%;
  text-align: center;
`;

export function MathEquations() {
  return (
    <Row>
      <Column>
        <p>3+9</p>
        <p>5+11</p>
        <p>4+13</p>
        <p>12+7</p>
        <p>14+28</p>
      </Column>
      <Column>
        <p>15+9</p>
        <p>8+21</p>
        <p>15-9</p>
        <p>27-4</p>
        <p>21-7</p>
      </Column>
      <Column>
        <p>3x7</p>
        <p>4x4</p>
        <p>13x3</p>
        <p>4x16</p>
        <p>8x8</p>
      </Column>
    </Row>
  );
}
