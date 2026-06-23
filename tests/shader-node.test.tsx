import { render, screen } from "@testing-library/react";

import { RenderShaderNode } from "@/app/components/workspace/shader-node/index";
import { createNode } from "@/utils/node";

import { mockNodeTypes } from "./node.mock";
jest.mock("@/src/store/project.store", () => ({
  useProjectStore: jest.fn((selector) =>
    selector({
      layers: {
        0: { nodes: [], edges: [] },
      },
      currentLayer: 0,
      onNodesChange: jest.fn(),
      onEdgesChange: jest.fn(),
      onConnect: jest.fn(),
      addNode: jest.fn(),
    }),
  ),
}));

jest.mock("@/src/utils/use-node-types", () => ({
  useNodeTypes: () => mockNodeTypes,
}));

describe("ShaderNode component", () => {
  const nodePosition = { x: 1, y: 2 };
  const nodeParameters = { test: { value: "test" } };

  const node = createNode("mix", nodePosition, mockNodeTypes, nodeParameters);
  const type = mockNodeTypes[node.data.type];

  const renderTestNode = () => {
    render(
      <RenderShaderNode
        mock
        type="RenderShaderNode"
        id={node.id}
        data={node.data}
        selected={false}
        dragging={false}
        draggable={false}
        selectable={false}
        deletable={false}
        isConnectable={false}
        positionAbsoluteX={0}
        positionAbsoluteY={0}
        zIndex={0}
      />,
    );
  };

  it("renders its type name", () => {
    renderTestNode();

    expect(screen.getByText(type.name)).toBeInTheDocument();
  });

  it("renders all inputs in order", () => {
    renderTestNode();

    const inputA = screen.getByText("A");
    const inputB = screen.getByText("B");
    const inputFactor = screen.getByText("Factor");

    expect(inputA).toBeInTheDocument();
    expect(inputB).toAppearAfter(inputA);
    expect(inputFactor).toAppearAfter(inputB);
  });

  it("renders outputs after inputs", () => {
    renderTestNode();

    const inputFactor = screen.getByText("Factor");
    const output = screen.getByText("Output");

    expect(inputFactor).toBeInTheDocument();
    expect(output).toAppearAfter(inputFactor);
  });
});
