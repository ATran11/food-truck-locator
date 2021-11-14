import styled from "styled-components";

export const DropdownWrapper = styled.form`
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
  width: 275px;
`;

export const StyledSelect = styled.select`
  max-width: 50%;
  height: 100%;
  padding: 0.5rem;
`;

export const StyledOption = styled.option`
  color: ${(props) => (props.selected = "black")};
`;

export const StyledLabel = styled.label`
  margin-bottom: 1rem;
`;