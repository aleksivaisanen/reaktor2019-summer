import React, { Component } from 'react';
import { Container, Form, FormGroup, Label, Input } from 'reactstrap'
import axios from 'axios';
import './index.css';
import Select from 'react-select';
import { LineChart, Legend } from 'react-easy-chart'


class App extends Component {

  constructor(props) {
    super(props);
    this.chartContainer = React.createRef();
    this.state = {
      loading: true,
      currentCountries: undefined,
      countryNames: undefined,
      selectOptions: undefined,
      selectedOptions: undefined,
      chartData: { x: 0, y: 0 },
      perCapita: false,
      containerWidth: null,
    };
  }

  componentDidMount = () => {
    this.chartContainer && this.fitParentContainer();
    //event listener for responsive chart width
    window.addEventListener('resize', this.fitParentContainer)

    axios.get('http://localhost:8080/api/countrynames')
      .then(res => {
        const options = res.data.map((item, index) => ({ label: item, value: index }))
        this.setState({
          countryNames: res.data,
          selectOptions: options,
          loading: false
        });
      })
      .catch((error) => {
        console.log(error)
      });
  }

  //event listener handling
  componentWillUnmount = () => {
    window.removeEventListener('resize', this.fitParentContainer)
  }

  fitParentContainer = () => {
    const { containerWidth } = this.state
    const currentContainerWidth = this.chartContainer.current
      .getBoundingClientRect().width

    const shouldResize = containerWidth !== currentContainerWidth

    if (shouldResize) {
      this.setState({
        containerWidth: currentContainerWidth,
      })
    }
  }

  //function for changing the current country
  changeCurrentCountries = (options) => {

    let countries = options.map(country => country.label);
    countries = countries.join('+');
    countries = countries.split(" ").join("_");
    //if input is cleared, only clear the data
    if (options.length > 0) {
      this.setState({
        loading: true
      }, () => axios.get('http://localhost:8080/api/country/name/' + countries)
        .then(res => {
          //if only single country is received
          if (!Array.isArray(res.data)) {
            this.setState({
              currentCountries: res.data,
              selectedOptions: this.state.selectOptions.find(item => item.label === res.data.name),
              loading: false
            }, this.setChartData);
          }
          else {
            let options = this.state.selectOptions.filter(option => res.data.map(item => item.name).find(item => item === option.label))
            this.setState({
              currentCountries: res.data,
              selectedOptions: options,
              loading: false
            }, this.setChartData)
          }
        })
        .catch((error) => {
          console.log(error)
        })
      )

    }
    //input is cleared
    else {
      this.setState({
        currentCountries: undefined,
        selectedOptions: []
      })
    }

  }

  //function for making the chart data correct 
  //(removing null values from the end where there is yet no data)
  setChartData = () => {
    if (!Array.isArray(this.state.currentCountries)) {
      let newChartData = this.state.currentCountries.data;
      for (let i = 0; i < newChartData.length; i++) {
        //removes null items from chartData array
        console.log(newChartData[i].emissions)
        if (newChartData[i].emissions === null) {
          newChartData.splice(i, 1);
          --i;
        }
      }
      console.log(this.state.currentCountries)
      this.setState({
        currentCountries: this.state.currentCountries
      })
    } else {
      let newChartData = this.state.currentCountries;
      for (let i = 0; i < newChartData.length; i++) {
        let item = newChartData[i].data;
        for (let j = 0; j < item.length; j++) {
          //removes null items from chartData array
          if (item[j].emissions === null) {
            item.splice(j, 1);
            --j;
          }
        }
        newChartData[i].data = item;
      }
      console.log(this.state.currentCountries)
      this.setState({
        currentCountries: this.state.currentCountries
      })
    }
  }

  //function for getting the chartData correctly
  getChartData = () => {
    //if there is only a single country
    if (!Array.isArray(this.state.currentCountries)) {
      return [this.state.perCapita ?
        this.state.currentCountries.data.map(item => ({ x: item.year, y: (item.emissions / item.population) })) :
        this.state.currentCountries.data.map(item => ({ x: item.year, y: (item.emissions) }))]
    }
    //if there are more than one country selected
    else {
      let data;
      let item;
      data = this.state.currentCountries.map(item => item.data);
      for (let i = 0; i < data.length; i++) {
        if (this.state.perCapita) {
          item = data[i].map(item => ({ x: item.year, y: (item.emissions / item.population) }));
        } else {
          item = data[i].map(item => ({ x: item.year, y: item.emissions }));
        }
        data[i] = item;
      }
      return data;
    }

  }

  //function for rendering the chart with the correct width
  renderChart = () => {
    const parentWidth = this.state.containerWidth
    return (
      this.state.currentCountries &&
      <div>
        <LineChart
          axes
          axisLabels={
            this.state.perCapita ?
              { x: 'Years', y: 'CO2 emissions per capita (in kilo tons)' } :
              { x: 'Years', y: 'CO2 emissions (in kilo tons)' }
          }
          grid
          verticalGrid
          xType={'text'}
          lineColors={['red']}
          width={parentWidth}
          height={500}
          margin={{ top: 20, right: 20, bottom: 60, left: 80 }}
          data={this.getChartData()}
          style={{ '.label': { fill: 'black' } }}
        />
      </div>
    )
  }
  render() {
    const { containerWidth } = this.state
    const shouldRenderChart = containerWidth !== null
    return (
      <Container>
        {this.state.selectOptions &&
          <Select
            name="countries"
            isMulti={true}
            isLoading={this.state.loading}
            options={this.state.selectOptions}
            value={this.state.selectedOptions ? this.state.selectedOptions : ""}
            onChange={opt => this.changeCurrentCountries(opt)}
          />
        }
        <Form>
          <FormGroup>
            <Label check>
              <Input type="checkbox" value={this.state.perCapita} onChange={() => this.setState({ perCapita: !this.state.perCapita })} />{' '}
              CO2 emissions per capita (kilo ton per person)
            </Label>
          </FormGroup>
        </Form>
        <div
          ref={this.chartContainer}
          className="Responsive-wrapper"
        >
          {shouldRenderChart && this.renderChart()}
        </div>

      </Container>
    );
  }
}

export default App;