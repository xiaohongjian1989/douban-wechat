(function ($) {
  let ui = {
    $tables: $('footer>div'),
    $panels: $('section'),
    $top: $('section').eq(0),
    $NA: $('section').eq(1),
    $search: $('section').eq(2),
    $searchBtn : $('.click'),
    $details : $('#details'),
    $back: $('.back'),
    $content: $('.content'),
    $up : $('.up')

  };

  var start = [0, 0];
  var length = 20;
  var isFinsh = [false, false, false];
  var lock = "";
  var getDetailsLock = ""
  var val = ""
  var id = ""
  var urlTop = '//api.douban.com/v2/movie/top250';
  var urlNA = '//api.douban.com/v2/movie/us_box';
  var urlSearch = '//api.douban.com//v2/movie/search';
  var urlDetails = '//api.douban.com/v2/movie/subject/';
  var oPage = {
    init: function () {
      this.view();
      this.listen();
    }
    , view: function () {
      let _this = this
      ui.$tables.click(function () {
        let index = $(this).index()
        ui.$panels.removeClass('active').hide().eq(index).addClass('active').fadeIn()
        $(this).addClass('active').siblings().removeClass('active');
        if (start[index] === 0 && index == 1) {
          _this.getData(ui.$NA, urlNA, 1)
        } else if (start[index] === 0 && index == 0) {
          _this.getData(ui.$top, urlTop, 0)
        }
      })

      ui.$content.click((ev) => {
        let $item = $(ev.target).parents('.item')
        let $id = $item.find('input').val()
        if (id != $id) {
          id = $id
          ui.$details.find('.item').text("")
          this.getDetails()
          return
        }
        this.showDetails();
      })

      ui.$back.click((event) => {
        this.closeDetails()
        event.stopPropagation();
      })
    }
    , listen: function () {
      this.getData(ui.$top, urlTop, 0)

      this.scrollAll(ui.$top, urlTop, 0)
      this.scrollAll(ui.$NA, urlNA, 1)
      this.scrollAll(ui.$search, urlSearch, 2)
      this.showTopBtn(ui.$top)
      this.showTopBtn(ui.$NA)
      this.showTopBtn(ui.$search)
      this.goToTop(ui.$top)
      this.goToTop(ui.$NA)
      this.goToTop(ui.$search)
      this.searchClick()
    }
    , getImage: function (url) {
      // 把现在的图片连接传进来，返回一个不受限制的路径
      if (url !== undefined) {
        return 'https://images.weserv.nl/?url=' + url.slice(7)
      }
    }
    , setTopData: function ($section, data) {
      data.subjects.forEach(element => {
        let tpl = `
      <div class="item">
      <a href="#" >
        <div class="cover">
          <img src="" alt="">
        </div>
        <div class="detail">
          <h2></h2>
          <div class="extra">
            <span class="score"></span>分 / <span class=collect_count></span>收藏</div>
          <div class="extra"><span class="year"></span> / <span class="genres"></span></div>
          <div class="extra">导演： <span class="directors"></span></div>
          <div class="extra">主演： <span class="casts"></span></div>
          <input type="hidden" value=""> 
        </div>
      </a>
    </div>
      `
        var $node = $(tpl)
        $node.find('.cover img').attr('src', this.getImage(element.images.medium))
        $node.find('h2').text(element.title)
        $node.find('.detail .score').text(element.rating.average)
        $node.find('.detail .collect_count').text(element.collect_count)
        $node.find('.detail .year').text(element.year)
        $node.find('.detail .directors').text(() => {
          let directors = []
          element.directors.forEach((el) => {
            directors.push(el.name)
          })
          return directors.join('、')
        })
        $node.find('.detail .genres').text(() => {
          let genres = []
          element.genres.forEach((el) => {
            genres.push(el)
          })
          return genres.join('、')
        })
        $node.find('.detail .casts').text(() => {
          let casts = []
          element.casts.forEach((el) => {
            casts.push(el.name)
          })
          return casts.join('、')
        })
        $node.find('.detail input').val(element.id)

        $section.find('.content').append($node)
      });
    }
    , setNAData($section, data) {
      data.subjects.forEach(element => {
        let tpl = `
          <div class="item">
          <a href="#" >
            <div class="cover">
              <img src="" alt="">
            </div>
            <div class="detail">
              <h2></h2>
              <div class="extra">
                <span class="score"></span>分 / <span class=collect_count></span>收藏</div>
              <div class="extra"><span class="year"></span> / <span class="genres"></span></div>
              <div class="extra">导演： <span class="directors"></span></div>
              <div class="extra">主演： <span class="casts"></span></div>
              <div class="extra">票房： <span class="box"></span></div>
              <input type="hidden" value="">
            </div>
          </a>
        </div>
          `
        var $node = $(tpl)
        $node.find('.cover img').attr('src', this.getImage(element.subject.images.medium))
        $node.find('h2').text(element.subject.title)
        $node.find('.detail .score').text(element.subject.rating.average)
        $node.find('.detail .collect_count').text(element.subject.collect_count)
        $node.find('.detail .year').text(element.subject.year)
        $node.find('.detail .box').text(element.box)
        $node.find('.detail .directors').text(() => {
          let directors = []
          element.subject.directors.forEach((el) => {
            directors.push(el.name)
          })
          return directors.join('、')
        })
        $node.find('.detail .genres').text(() => {
          let genres = []
          element.subject.genres.forEach((el) => {
            genres.push(el)
          })
          return genres.join('、')
        })
        $node.find('.detail .casts').text(() => {
          let casts = []
          element.subject.casts.forEach((el) => {
            casts.push(el.name)
          })
          return casts.join('、')
        })
        $node.find('.detail input').val(element.subject.id)

        $section.find('.content').append($node)
      });
    }
    , scrollAll: function ($section, urlTop, index) {
      $section.scroll(() => {
        if ($section.find('.content').height() - 10 <= $section.scrollTop() + $section.height()) {
          if (index === 2) {
            this.getSearchData()
            return;
          }
          this.getData($section, urlTop, index)
        }
      })
    }
    , getData: function ($section, url, index) {

      if (isFinsh[index]) return
      if (lock) {
        clearTimeout(lock)
      }
      $section.find('.loading').show();
      let _this = this
      lock = setTimeout(function() {
        $.ajax({
          url: url,
          type: 'GET',
          data: {
            start: start[index],
            count: this.length
          },
          dataType: 'jsonp'
        }).done(function (result) {
          console.log(result)
          if (index === 0) {
            _this.setTopData($section, result)
          } else if (index === 1) {
            _this.setNAData($section, result)
          }
          start[index] += 20
          if (start[index] >= result.total) {
            isFinsh[index] = true
          }
        }).fail(function (error) {
          console.log(error)
        }).always(() => {
          $section.find('.loading').hide()
        })
      }, 1000)

    }
    , getSearchData() {
      if (lock) {
        clearTimeout(lock)
      }
      if (isFinsh[2]) return
      ui.$search.find('.loading').show();
      let _this = this
      lock = setTimeout(() => {
        $.ajax({
          url: urlSearch,
          type: 'GET',
          data: {
            q: val,
            start: start[2]
          },
          dataType: 'jsonp'
        }).done(function (result) {
          _this.setTopData(ui.$search, result)
          start[2] += 20
          if (start[2] >= result.total) {
            isFinsh[2] = true
          }
        }).fail(function (error) {
          console.log('数据异常')
        }).always(() => {
          ui.$search.find('.loading').hide()
        })
      }, 1000)
    }
    , searchClick() {
      let index = 2
      ui.$search.find('.click').click(() => {
        if (ui.$search.find('input').val() != '') {
          ui.$search.find('.content').text("")
          val = ui.$search.find('input').val()
          start.push(0)
          isFinsh[index] = false 
          this.getSearchData()
        }
      })
    }
    , getDetails: function() {
      if (getDetailsLock) {
        clearTimeout(getDetailsLock)
      }
      let _this = this;
      this.showDetails();
      ui.$details.find('.loading').show();
      getDetailsLock = setTimeout(() => {
        $.ajax({
          url: urlDetails + id,
          type: 'GET',
          dataType: 'jsonp'
        }).done(function (result) {
          _this.setDetails(result)
        }).always(function() {
          ui.$details.find('.loading').hide();
        })
      }, 1000) 
    }
    , setDetails: function (result) {
      var tpl = `
      <div>
        <h2>biaoti mingcheng</h2>
        <div class="cover">
          <img>
        </div>
        <h4>内容简介</h4>
        <div class="content">
        </div>
      </div>  
      `
      var $node = $(tpl)
      $node.find('h2').text(result.title)
      $node.find('img').attr('src', this.getImage(result.images.large))
      $node.find('.content').text(result.summary)

      ui.$details.find('.item').append($node)
    }
    , showDetails: function () {
      ui.$details.animate({
        left: 0,
      }, 1000)
    }
    , closeDetails: function () {
      ui.$details.animate({
        left: '100vw'
      }, 1000)
    }
    , showTopBtn: function ($section) {
      $section.scroll(() => {
        if ($section.scrollTop() > 20) {
          $section.find('.up').show()
        }
        if ($section.scrollTop() <= 0) {
          $section.find('.up').hide()
        }
      })
    }
    ,goToTop: function ($section) {
      $section.find('.up').click(() => {
        $section.animate({
          scrollTop: '0'
        }, 2000)
      })
    }
  };
  oPage.init();
})($);